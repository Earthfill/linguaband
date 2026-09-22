// Write an audio manifest for one mock into D1 (marks it "ready") via the REST API.
// Usage: node scripts/d1-write.mjs <mockId> <manifest.json>
// Env:    CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_API_TOKEN

import { promises as fs } from "node:fs";

const [mockId, manifestPath] = process.argv.slice(2);
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const db = process.env.CLOUDFLARE_DATABASE_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!account || !db || !token || !mockId || !manifestPath) {
  console.error("missing CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_DATABASE_ID / CLOUDFLARE_API_TOKEN / mockId / manifestPath");
  process.exit(1);
}

const audio = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${db}/query`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      sql: "UPDATE mocks SET audio = ?, status = 'ready', updated_at = ? WHERE id = ?",
      params: [JSON.stringify(audio), new Date().toISOString(), mockId],
    }),
  },
);
const data = await res.json();
if (!res.ok || !data?.success) {
  console.error(JSON.stringify(data ?? { status: res.status }));
  process.exit(1);
}
console.log(`manifest written for ${mockId}`);
