// Audits listening audio for every stored mock: which sections exist, whether the
// files in the bucket actually resolve, and which TTS engine produced them.
//
// Usage:
//   node scripts/audit-audio.mjs              # remote D1 + live HEAD checks
//   node scripts/audit-audio.mjs --no-head     # skip network checks
//
// Needs CLOUDFLARE_* env vars (CI) or a local `wrangler login`.
// Exit code 1 = something needs attention (missing/broken audio for a listening mock).

import { d1Query } from "./lib/d1.mjs";

const noHead = process.argv.includes("--no-head");

/** Listening sections a mock actually has (audio is only expected for those). */
function listeningSections(payload) {
  try {
    const exam = JSON.parse(payload);
    return (exam.sections ?? []).filter((s) => s.skill === "listening" && s.passage).length;
  } catch {
    return 0;
  }
}

/** 32 kbps + `?v=` is the Google Cloud TTS signature; 96/48 kbps without it is the old Edge build. */
function engine(entry) {
  const versioned = typeof entry.src === "string" && entry.src.includes("?v=");
  if (versioned) return "google";
  if (entry.bitrate === 96 || entry.bitrate === 48) return "edge";
  return "unknown";
}

const rows = await d1Query("SELECT id, status, audio, payload FROM mocks ORDER BY id");
if (rows.length === 0) {
  console.log("No mocks in D1.");
  process.exit(0);
}

let problems = 0;
const summary = [];

for (const row of rows) {
  const audio = row.audio ? JSON.parse(row.audio) : {};
  const ids = Object.keys(audio);
  const expected = listeningSections(row.payload);
  const engines = new Set();
  const broken = [];

  for (const id of ids) {
    const entry = audio[id];
    engines.add(engine(entry));
    if (noHead) continue;
    try {
      const res = await fetch(entry.src, { method: "HEAD" });
      if (res.status !== 200) broken.push(`${id}:${res.status}`);
    } catch (err) {
      broken.push(`${id}:${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const status = `${row.status}`.padEnd(10);
  const engineLabel = ids.length === 0 ? "—" : [...engines].join("+");
  const line =
    `${row.id.padEnd(9)} ${status} audio=${String(ids.length).padEnd(2)}/${String(expected).padEnd(2)}` +
    ` engine=${engineLabel}` +
    (broken.length ? ` BROKEN: ${broken.join(", ")}` : "");
  console.log(line.trimEnd());

  const issues = [];
  if (ids.length < expected) {
    issues.push(`${expected - ids.length} listening section(s) without audio`);
  }
  if (engines.has("edge")) issues.push("still on Microsoft/Edge audio");
  if (broken.length) issues.push(`unreachable files: ${broken.join(", ")}`);
  if (issues.length) {
    problems += 1;
    console.log(`  ↳ ${issues.join("; ")}`);
  }

  summary.push({ id: row.id, status: row.status, sections: ids.length, expected, engine: engineLabel });
}

const edge = summary.filter((m) => m.engine.includes("edge")).map((m) => m.id);
const missing = summary.filter((m) => m.sections < m.expected).map((m) => m.id);

console.log("");
if (edge.length) console.log(`Still on Microsoft/Edge audio: ${edge.join(", ")}`);
if (missing.length) console.log(`Listening audio missing for: ${missing.join(", ")}`);
if (!problems) console.log("All listening audio is Google Cloud TTS (Chirp 3: HD) with reachable files.");
console.log("Backfill with: node scripts/dispatch-audio-all.mjs");

process.exit(problems ? 1 : 0);
