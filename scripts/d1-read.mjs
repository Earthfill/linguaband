// Fetch one mock's payload from D1 via the Cloudflare REST API and print it to stdout.
// Usage: node scripts/d1-read.mjs <mockId>
// Env:    CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_API_TOKEN
//
// Retries with backoff: right after /admin writes the row it can take a moment to
// become visible to the REST API, and a first-attempt miss used to fail the whole
// audio job (the mock then sat at "generating" with no audio).

const [mockId] = process.argv.slice(2);
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const db = process.env.CLOUDFLARE_DATABASE_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!account || !db || !token || !mockId) {
  console.error("missing CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_DATABASE_ID / CLOUDFLARE_API_TOKEN / mockId");
  process.exit(1);
}

const ATTEMPTS = 6;
const DELAY_MS = 3000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPayload() {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${db}/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sql: "SELECT payload FROM mocks WHERE id = ?", params: [mockId] }),
    },
  );
  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(JSON.stringify(data ?? { status: res.status }));
  }
  return data?.result?.[0]?.results?.[0]?.payload ?? null;
}

let payload = null;
let lastError = null;
for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
  try {
    payload = await fetchPayload();
    lastError = null;
  } catch (err) {
    lastError = err;
  }
  if (payload) break;
  console.warn(
    lastError
      ? `D1 query failed (attempt ${attempt}/${ATTEMPTS}): ${lastError.message}`
      : `mock "${mockId}" not visible in D1 yet (attempt ${attempt}/${ATTEMPTS})`,
  );
  if (attempt < ATTEMPTS) await sleep(DELAY_MS);
}

if (!payload) {
  console.error(
    lastError
      ? `could not read mock "${mockId}" from D1: ${lastError.message}`
      : `no row for mock "${mockId}" in D1 — upload it through /admin first (or check the id spelling).`,
  );
  process.exit(1);
}

process.stdout.write(payload);
