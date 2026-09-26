// Read-only D1 access for scripts.
//
// Uses the Cloudflare REST API when CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_DATABASE_ID /
// CLOUDFLARE_API_TOKEN are set (CI), otherwise shells out to the wrangler CLI with the
// locally logged-in OAuth session (`wrangler login`).

import { execSync } from "node:child_process";

const DB_NAME = process.env.CLOUDFLARE_DATABASE_NAME ?? "linguaband-db";

export function hasRestCreds() {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_DATABASE_ID && process.env.CLOUDFLARE_API_TOKEN,
  );
}

/**
 * Run one read-only SQL statement and return its rows.
 * Keep the SQL simple (single quotes only inside values) — the wrangler fallback
 * passes it through the shell.
 */
export async function d1Query(sql) {
  if (hasRestCreds()) {
    const url =
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}` +
      `/d1/database/${process.env.CLOUDFLARE_DATABASE_ID}/query`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql }),
    });
    const data = await res.json();
    if (!res.ok || !data?.success) {
      throw new Error(`D1 REST query failed: ${JSON.stringify(data).slice(0, 400)}`);
    }
    return data.result?.[0]?.results ?? [];
  }

  const out = execSync(`npx wrangler d1 execute ${DB_NAME} --remote --json --command "${sql}"`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    env: { ...process.env, CI: "1" },
  });
  const parsed = JSON.parse(out);
  return parsed?.[0]?.results ?? [];
}

/** `{ id, status, audio }` for every stored mock. */
export async function allMockRows() {
  return d1Query("SELECT id, status, audio FROM mocks ORDER BY id");
}

export async function mockIds() {
  const rows = await d1Query("SELECT id FROM mocks ORDER BY id");
  return rows.map((r) => r.id);
}
