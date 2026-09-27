// Fetch one listening practice track from D1 and print its payload to stdout.
// Usage: node scripts/d1-practice-read.mjs <trackId>
// Env: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_API_TOKEN

const [trackId] = process.argv.slice(2);
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const db = process.env.CLOUDFLARE_DATABASE_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!account || !db || !token || !trackId) {
  console.error("missing CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_DATABASE_ID / CLOUDFLARE_API_TOKEN / trackId");
  process.exit(1);
}

const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${db}/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    sql: "SELECT payload FROM practice_sets WHERE id = ? AND skill = 'listening'",
    params: [trackId],
  }),
});
const data = await res.json();
if (!res.ok || !data?.success) {
  console.error(JSON.stringify(data ?? { status: res.status }));
  process.exit(1);
}
const payload = data?.result?.[0]?.results?.[0]?.payload;
if (!payload) {
  console.error(`no listening practice set "${trackId}" found in D1`);
  process.exit(1);
}
process.stdout.write(payload);