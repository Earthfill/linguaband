// Set one mock's status in D1 (used by the workflow's failure path, and by hand to
// unstick a mock that is stuck on "generating").
//
// Usage: node scripts/d1-status.mjs <mockId> <content|generating|ready|failed>
// Env:   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_API_TOKEN
//        (falls back to the local wrangler login when those are not set)

import { execSync } from "node:child_process";

const [mockId, status] = process.argv.slice(2);
const ALLOWED = ["content", "generating", "ready", "failed"];
if (!mockId || !ALLOWED.includes(status)) {
  console.error(`usage: node scripts/d1-status.mjs <mockId> <${ALLOWED.join("|")}>`);
  process.exit(1);
}

const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const db = process.env.CLOUDFLARE_DATABASE_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
const sql = `UPDATE mocks SET status = '${status}', updated_at = '${new Date().toISOString()}' WHERE id = '${mockId}'`;

if (account && db && token) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${db}/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
    },
  );
  const data = await res.json();
  if (!res.ok || !data?.success) {
    console.error(JSON.stringify(data ?? { status: res.status }));
    process.exit(1);
  }
} else {
  const name = process.env.CLOUDFLARE_DATABASE_NAME ?? "linguaband-db";
  execSync(`npx wrangler d1 execute ${name} --remote --command "${sql}"`, {
    stdio: "inherit",
    env: { ...process.env, CI: "1" },
  });
}

console.log(`${mockId} -> ${status}`);
