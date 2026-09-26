// Generates listening audio for ONE mock (called from GitHub Actions).
// Synthesizes each listening section with Google Cloud Text-to-Speech (Chirp 3: HD),
// writes one MP3 per section into <outdir>, and emits <outdir>/manifest.json
// (an audio map keyed by section id, with full `src` URLs).
//
// Usage: node scripts/generate-mock-audio.mjs <mock.json> <outdir>
// Env:   AUDIO_BASE_URL                  public prefix for the MP3s
//        GOOGLE_APPLICATION_CREDENTIALS  path to the service-account JSON
//                                        (falls back to .secrets/gcp-tts.json)
//
// A mock with no listening sections exits 0 with an empty manifest so the caller
// can still mark it ready (see .github/workflows/generate-audio.yml).

import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { buildSectionAudio, parseDialogue, tokenFromKey } from "./lib/gcp-tts.mjs";

async function main() {
  const [mockPath, outDir] = process.argv.slice(2);
  if (!mockPath || !outDir) {
    console.error("usage: node scripts/generate-mock-audio.mjs <mock.json> <outdir>");
    process.exit(1);
  }
  const token = await tokenFromKey();
  const mock = JSON.parse(await fs.readFile(mockPath, "utf8"));
  const base = (process.env.AUDIO_BASE_URL ?? "").replace(/\/+$/, "");
  await fs.mkdir(outDir, { recursive: true });

  const manifest = {};
  const skipped = [];
  let listening = 0;

  for (const section of mock.sections ?? []) {
    if (section.skill !== "listening" || !section.passage) continue;
    listening += 1;
    const segments = parseDialogue(section.passage);
    if (segments.length === 0) {
      // No `SPEAKER: text` lines — nothing to read aloud.
      console.warn(`skip ${section.id}: no dialogue`);
      skipped.push(section.id);
      continue;
    }
    process.stdout.write(`${section.id} `);
    const audio = await buildSectionAudio({
      token,
      segments,
      onChunk: () => process.stdout.write("."),
    });
    const file = path.join(outDir, `${section.id}.mp3`);
    await fs.writeFile(file, audio.buffer);
    // Content hash in the URL so a re-generation is never masked by a cached copy.
    const version = createHash("sha1").update(audio.buffer).digest("hex").slice(0, 8);
    const src = base
      ? `${base}/${mock.id}/${section.id}.mp3?v=${version}`
      : `/audio/${mock.id}/${section.id}.mp3?v=${version}`;
    manifest[section.id] = {
      group: mock.id,
      src,
      bitrate: audio.bitrate,
      durationSec: audio.durationSec,
      segments: audio.segments,
    };
    console.log(` -> ${file} (${audio.durationSec}s)`);
  }

  await fs.writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  const count = Object.keys(manifest).length;
  console.log(`manifest.json written (${count} section${count === 1 ? "" : "s"})`);

  if (count === 0) {
    const why = listening === 0 ? "no listening sections" : `skipped: ${skipped.join(", ")}`;
    console.warn(`No audio generated for ${mock.id} — ${why}.`);
  } else if (skipped.length) {
    console.warn(`Skipped ${skipped.length} section(s) with no dialogue: ${skipped.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
