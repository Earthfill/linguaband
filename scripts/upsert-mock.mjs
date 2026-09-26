// Insert or update a mock row in D1 (same effect as uploading through /admin, but
// from the command line — handy for the bundled mock-01 export).
//
// Usage:
//   node scripts/upsert-mock.mjs scripts/sample-mock-01.json            # remote D1
//   node scripts/upsert-mock.mjs scripts/sample-mock-01.json --local    # local D1
//   node scripts/upsert-mock.mjs scripts/sample-mock-01.json --status=generating
//
// Existing audio for the mock is preserved (only payload/status/updated_at change).
// Push the JSON through /admin instead if you want the app to dispatch the audio job.

import { execSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

const DB_NAME = process.env.CLOUDFLARE_DATABASE_NAME ?? "linguaband-db";

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith("--"));
const mockPath = args.find((a) => !a.startsWith("--"));
const local = flags.includes("--local");
const status = (flags.find((f) => f.startsWith("--status=")) ?? "--status=content").split("=")[1];

if (!mockPath) {
  console.error("usage: node scripts/upsert-mock.mjs <mock.json> [--local] [--status=content]");
  process.exit(1);
}

const exam = JSON.parse(await fs.readFile(mockPath, "utf8"));
if (!exam?.id || !Array.isArray(exam.sections) || exam.sections.length === 0) {
  console.error(`${mockPath} does not look like a mock exam (needs id + sections)`);
  process.exit(1);
}

const q = (v) => `'${String(v).replace(/'/g, "''")}'`;
const now = new Date().toISOString();
const sql =
  "INSERT INTO mocks (id, payload, audio, status, created_at, updated_at)\n" +
  `VALUES (${q(exam.id)}, ${q(JSON.stringify(exam))}, NULL, ${q(status)}, ${q(now)}, ${q(now)})\n` +
  "ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, status = excluded.status, updated_at = excluded.updated_at;\n";

const file = path.join(os.tmpdir(), `linguaband-upsert-${exam.id}.sql`);
await fs.writeFile(file, sql, "utf8");
try {
  const cmd =
    `npx wrangler d1 execute ${DB_NAME} --file "${file}"` + (local ? "" : " --remote");
  execSync(cmd, { stdio: "inherit", env: { ...process.env, CI: "1" } });
} finally {
  await fs.rm(file, { force: true });
}

console.log(`upserted ${exam.id} (${exam.sections.length} sections, status=${status}) ${local ? "locally" : "remotely"}`);
console.log(`next: node scripts/dispatch-audio-all.mjs ${exam.id}`);
