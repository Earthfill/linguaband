// Fetch one mock's payload from D1 via the Cloudflare REST API and print it to stdout.
// Usage: node scripts/d1-read.mjs <mockId>
// Env:    CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_API_TOKEN

const [mockId] = process.argv.slice(2);
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const db = process.env.CLOUDFLARE_DATABASE_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!account || !db || !token || !mockId) {
  console.error("missing CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_DATABASE_ID / CLOUDFLARE_API_TOKEN / mockId");
  process.exit(1);
}

const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${db}/query`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ sql: "SELECT payload FROM mocks WHERE id = ?", params: [mockId] }),
  },
);
const data = await res.json();
const rows = data?.result?.[0]?.results ?? [];
if (!res.ok || !data?.success || rows.length === 0) {
  console.error(JSON.stringify(data ?? { status: res.status }));
  process.exit(1);
}
process.stdout.write(rows[0].payload);
