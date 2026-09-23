// One-shot rename: shilu -> linguaband. Run with `node rename.mjs` from the project root.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

// Run a command and capture its output without throwing on failure.
function run(cmd) {
  try {
    return execSync(cmd, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, CI: "1" },
    });
  } catch (e) {
    return (e.stdout || "") + (e.stderr || "");
  }
}

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

// 1. Create the D1 database (and capture its id, even if it already exists)
let d1out = run("npx wrangler d1 create linguaband-db");
let dbId = d1out.match(UUID)?.[0];
if (!dbId) {
  const list = run("npx wrangler d1 list");
  const line = list.split("\n").find((l) => l.includes("linguaband-db"));
  dbId = line?.match(UUID)?.[0];
}
if (!dbId) throw new Error("Could not determine linguaband-db id. Run: npx wrangler d1 list");
console.log("D1 id:", dbId);

// 2. Create the R2 bucket
console.log(run("npx wrangler r2 bucket create linguaband-audio"));

// 3. Rewrite wrangler.jsonc (renamed + duplicate bindings removed)
const cfg = {
  $schema: "node_modules/wrangler/config-schema.json",
  name: "linguaband",
  main: ".open-next/worker.js",
  compatibility_date: "2026-09-22",
  compatibility_flags: ["nodejs_compat"],
  assets: { directory: ".open-next/assets", binding: "ASSETS" },
  d1_databases: [
    { binding: "DB", database_name: "linguaband-db", database_id: dbId, migrations_dir: "migrations" },
  ],
  r2_buckets: [{ binding: "BUCKET", bucket_name: "linguaband-audio" }],
};
writeFileSync("wrangler.jsonc", JSON.stringify(cfg, null, 2) + "\n");
console.log("wrangler.jsonc rewritten");

// 4. Apply the migration
console.log(run("npx wrangler d1 migrations apply linguaband-db --remote"));

// 5. Literal text replacements (split/join = exact, case-sensitive)
const edits = [
  ["src/app/layout.tsx", [["Shilu", "Linguaband"]]],
  ["src/components/AboutSection.tsx", [["Shilu", "Linguaband"]]],
  ["src/components/Footer.tsx", [["Shilu", "Linguaband"]]],
  ["src/data/content.ts", [["Shilu", "Linguaband"]]],
  ["src/data/testimonials.ts", [["Shilu", "Linguaband"]]],
  ["src/lib/auth.ts", [["shilu_admin", "linguaband_admin"]]],
  ["src/components/practice/MockExamPlayer.tsx", [["shilu.mock.attempt", "linguaband.mock.attempt"]]],
  ["src/app/api/admin/upload/route.ts", [["shilu-admin", "linguaband-admin"]]],
  ["src/components/ui/Logo.tsx", [["Shilu home", "Linguaband home"], ["Shi<span", "Lingua<span"], [">lu<", ">band<"]]],
  ["src/data/faqs.ts", [["support@shilu.ai", "support@linguaband.com"], ["Shilu", "Linguaband"]]],
  ["src/components/ui/DashboardMockup.tsx", [["shilu.ai/practice/listening", "linguaband.com/practice/listening"], ["Shilu", "Linguaband"]]],
  ["package.json", [["shilu", "linguaband"]]],
  ["package-lock.json", [["shilu", "linguaband"]]],
  [".dev.vars.example", [["GITHUB_REPO=Earthfill/shilu", "GITHUB_REPO=Earthfill/linguaband"]]],
  [".github/workflows/generate-audio.yml", [["shilu-audio", "linguaband-audio"]]],
  ["README.md", [["Shilu", "Linguaband"], ["shilu-db", "linguaband-db"], ["shilu-audio", "linguaband-audio"]]],
];

for (const [file, pairs] of edits) {
  let s = readFileSync(file, "utf8");
  for (const [from, to] of pairs) s = s.split(from).join(to);
  writeFileSync(file, s);
}

console.log("Rename complete.");
