// Copy audio manifests from REMOTE D1 into LOCAL D1, so `npm run dev` plays the same
// audio as production. Requires `wrangler login` and an existing local row for each
// mock (apply migrations, then upload the mock once locally).
//
// Usage:
//   npm run db:sync-audio -- mock-02     # one mock
//   npm run db:sync-audio -- --all       # every mock in remote D1
//   npm run db:sync-audio                # same as --all

import { execSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DB_NAME = "linguaband-db";

function run(cmd) {
  return execSync(cmd, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    env: { ...process.env, CI: "1" },
  });
}

function jsonRows(cmd) {
  const out = run(cmd);
  return JSON.parse(out)?.[0]?.results ?? [];
}

function remoteIds() {
  return jsonRows(
    `npx wrangler d1 execute ${DB_NAME} --remote --json --command "SELECT id FROM mocks ORDER BY id"`,
  ).map((row) => row.id);
}

function hasLocalRow(mockId) {
  try {
    return (
      jsonRows(
        `npx wrangler d1 execute ${DB_NAME} --local --json --command "SELECT id FROM mocks WHERE id = '${mockId}'"`,
      ).length > 0
    );
  } catch {
    return true; // can't tell — let the UPDATE decide
  }
}

function syncOne(mockId) {
  if (!hasLocalRow(mockId)) {
    return { ok: false, reason: "no local row yet — upload this mock once in local dev first" };
  }

  const rows = jsonRows(
    `npx wrangler d1 execute ${DB_NAME} --remote --json --command "SELECT audio FROM mocks WHERE id = '${mockId}'"`,
  );
  const audio = rows?.[0]?.audio ?? null;
  if (!audio) {
    return { ok: false, reason: "no remote audio (has the audio job finished?)" };
  }

  // Write via a temp SQL file so the JSON never goes through shell quoting.
  const sql =
    `UPDATE mocks SET audio = '${String(audio).replace(/'/g, "''")}', status = 'ready', ` +
    `updated_at = '${new Date().toISOString()}' WHERE id = '${mockId}';\n`;
  const file = join(tmpdir(), `linguaband-sync-${mockId}.sql`);
  writeFileSync(file, sql);
  try {
    run(`npx wrangler d1 execute ${DB_NAME} --file "${file}"`);
  } finally {
    rmSync(file, { force: true });
  }
  return { ok: true };
}

const arg = process.argv[2];
const ids = !arg || arg === "--all" ? remoteIds() : [arg];
if (ids.length === 0) {
  console.error("No mocks found in remote D1.");
  process.exit(1);
}

let failed = 0;
for (const id of ids) {
  const result = syncOne(id);
  if (result.ok) console.log(`✓ ${id}: local audio synced (status = ready)`);
  else {
    failed += 1;
    console.error(`✗ ${id}: ${result.reason}`);
  }
}

console.log(`\nSynced ${ids.length - failed}/${ids.length} mock(s) into local D1.`);
if (failed) process.exit(1);
