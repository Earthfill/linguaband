// Store generated audio metadata for one listening practice track in D1.
// Usage: node scripts/d1-practice-write.mjs <trackId> <manifest.json>

import { promises as fs } from "node:fs";

const [trackId, manifestPath] = process.argv.slice(2);
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const db = process.env.CLOUDFLARE_DATABASE_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!account || !db || !token || !trackId || !manifestPath) {
  console.error("missing CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_DATABASE_ID / CLOUDFLARE_API_TOKEN / trackId / manifestPath");
  process.exit(1);
}
const audio = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${db}/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    sql: "UPDATE practice_sets SET audio = ?, audio_status = 'ready', updated_at = ? WHERE id = ? AND skill = 'listening'",
    params: [JSON.stringify(audio), new Date().toISOString(), trackId],
  }),
});
const data = await res.json();
if (!res.ok || !data?.success) {
  console.error(JSON.stringify(data ?? { status: res.status }));
  process.exit(1);
}
const changes = data?.result?.[0]?.meta?.changes;
if (changes === 0) {
  console.error(`no listening practice set "${trackId}" found in D1`);
  process.exit(1);
}
console.log(`audio metadata written for practice track ${trackId}`);