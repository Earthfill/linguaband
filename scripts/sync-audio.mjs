// Copy one mock's audio manifest from REMOTE D1 into LOCAL D1, so `npm run dev`
// plays the same audio as production. Requires `wrangler login` and an existing
// local row for the mock (apply migrations, then upload the mock once locally).
//
// Usage: npm run db:sync-audio -- mock-02

import { execSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function run(cmd) {
  return execSync(cmd, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    env: { ...process.env, CI: "1" },
  });
}

const mockId = process.argv[2];
if (!mockId) {
  console.error("usage: npm run db:sync-audio -- <mockId>");
  process.exit(1);
}

// 1. Read the manifest from remote D1.
const remote = run(
  `npx wrangler d1 execute linguaband-db --remote --json --command "SELECT audio FROM mocks WHERE id = '${mockId}'"`,
);
let audio = null;
try {
  const parsed = JSON.parse(remote);
  audio = parsed?.[0]?.results?.[0]?.audio ?? null;
} catch {
  audio = null;
}
if (!audio) {
  console.error(`No remote audio for "${mockId}" (has it finished generating?).`);
  process.exit(1);
}

// 2. Write it into local D1 via a temp SQL file (avoids shell-quoting issues).
const sql =
  `UPDATE mocks SET audio = '${audio.replace(/'/g, "''")}', status = 'ready', ` +
  `updated_at = '${new Date().toISOString()}' WHERE id = '${mockId}';\n`;
const file = join(tmpdir(), `linguaband-sync-${mockId}.sql`);
writeFileSync(file, sql);
try {
  console.log(run(`npx wrangler d1 execute linguaband-db --file "${file}"`));
} finally {
  rmSync(file, { force: true });
}
console.log(`Synced local D1 audio for "${mockId}" (status = ready).`);
