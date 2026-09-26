// Exports the built-in mock-01 (src/data/practice/mock01) to scripts/sample-mock-01.json.
//
// mock-01 originally shipped with bundled Microsoft/Edge audio that the Google TTS
// workflow can never regenerate (the workflow reads mock payloads from D1, and
// mock-01 did not exist there). Exporting it lets you push mock-01 into D1
// (scripts/upsert-mock.mjs or /admin), after which it is a normal stored mock with
// Google Cloud TTS audio in R2.
//
// Usage: node scripts/export-mock-01.mjs [outFile]

import { promises as fs } from "node:fs";
import path from "node:path";
import { loadTs } from "./lib/load-ts.mjs";

const out = process.argv[2] ?? path.join(process.cwd(), "scripts", "sample-mock-01.json");

const { mock01 } = await loadTs("src/data/practice/mock01/index.ts");

if (!mock01?.id || !Array.isArray(mock01.sections)) {
  throw new Error("could not read mock01 from src/data/practice/mock01/index.ts");
}

const skills = mock01.sections.reduce((acc, s) => {
  acc[s.skill] = (acc[s.skill] ?? 0) + 1;
  return acc;
}, {});

const json = JSON.stringify(mock01, null, 2) + "\n";
await fs.writeFile(out, json, "utf8");

console.log(`wrote ${out}`);
console.log(`${mock01.id} · ${mock01.name} · ${mock01.sections.length} sections · ${JSON.stringify(skills)}`);
console.log(`listening sections: ${mock01.sections.filter((s) => s.skill === "listening").map((s) => s.id).join(", ")}`);
