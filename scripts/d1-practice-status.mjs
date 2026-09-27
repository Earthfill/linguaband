// Update generation status for one listening practice track in D1.
// Usage: node scripts/d1-practice-status.mjs <trackId> <content|generating|ready|failed>

const [trackId, status] = process.argv.slice(2);
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const db = process.env.CLOUDFLARE_DATABASE_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!account || !db || !token || !trackId || !["content", "generating", "ready", "failed"].includes(status)) {
  console.error("missing Cloudflare credentials or invalid trackId/status");
  process.exit(1);
}
const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${db}/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    sql: "UPDATE practice_sets SET audio_status = ?, updated_at = ? WHERE id = ? AND skill = 'listening'",
    params: [status, new Date().toISOString(), trackId],
  }),
});
const data = await res.json();
if (!res.ok || !data?.success) {
  console.error(JSON.stringify(data ?? { status: res.status }));
  process.exit(1);
}
if (data?.result?.[0]?.meta?.changes === 0) {
  console.error(`no listening practice set "${trackId}" found in D1`);
  process.exit(1);
}
console.log(`practice track ${trackId} status=${status}`);