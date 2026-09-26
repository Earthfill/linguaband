// Triggers the "Generate Audio" workflow for one mock, several mocks, or every mock in D1.
//
// Usage:
//   node scripts/dispatch-audio-all.mjs                  # every mock in D1
//   node scripts/dispatch-audio-all.mjs mock-09          # just mock-09
//   node scripts/dispatch-audio-all.mjs mock-02 mock-03  # a list
//
// Env: GITHUB_TOKEN (needs actions:write / repo scope), GITHUB_REPO (owner/name).
//      CLOUDFLARE_* env vars (or a local `wrangler login`) are only needed when no
//      mock ids are passed on the command line.
//
// Note: the workflow regenerates exactly the mocks you list — there is no implicit
// backfill, which is why older mocks can still hold pre-Google audio.

import { mockIds } from "./lib/d1.mjs";

const repo = process.env.GITHUB_REPO;
const token = process.env.GITHUB_TOKEN;
if (!repo || !token) {
  console.error("missing GITHUB_REPO / GITHUB_TOKEN (see .env.local or .dev.vars.example)");
  process.exit(1);
}

const requested = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const ids = requested.length ? requested : await mockIds();

if (ids.length === 0) {
  console.log("No mocks to dispatch.");
  process.exit(0);
}
console.log(`Dispatching audio generation for: ${ids.join(", ")}\n`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "linguaband-audio-backfill",
  "X-GitHub-Api-Version": "2022-11-28",
};

async function dispatch(mockId) {
  const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: "POST",
    headers,
    body: JSON.stringify({ event_type: "generate-audio", client_payload: { mockId } }),
  });
  if (res.status === 204) return { ok: true, via: "repository_dispatch" };

  // Tokens without repo-dispatch permission can still start the workflow directly.
  const alt = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/generate-audio.yml/dispatches`,
    { method: "POST", headers, body: JSON.stringify({ ref: "main", inputs: { mockId } }) },
  );
  if (alt.status === 204) return { ok: true, via: "workflow_dispatch" };

  const detail = (await alt.text()).slice(0, 200);
  return { ok: false, via: `repository_dispatch ${res.status} / workflow_dispatch ${alt.status}`, detail };
}

let failed = 0;
for (const id of ids) {
  const result = await dispatch(id);
  if (result.ok) {
    console.log(`${id.padEnd(9)} queued (${result.via})`);
  } else {
    failed += 1;
    console.log(`${id.padEnd(9)} FAILED ${result.via} ${result.detail ?? ""}`);
  }
  await sleep(1200);
}

console.log(`\n${ids.length - failed}/${ids.length} queued. Each run takes ~2-12 min.`);
console.log("Then verify with: node scripts/audit-audio.mjs");
process.exit(failed ? 1 : 0);
