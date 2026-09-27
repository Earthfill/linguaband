// Generate one listening practice track's audio and metadata.
// Usage: node scripts/generate-practice-audio.mjs <track.json> <outdir>

import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { buildSectionAudio, parseDialogue, tokenFromKey } from "./lib/gcp-tts.mjs";

const [trackPath, outDir] = process.argv.slice(2);
if (!trackPath || !outDir) {
  console.error("usage: node scripts/generate-practice-audio.mjs <track.json> <outdir>");
  process.exit(1);
}

const track = JSON.parse(await fs.readFile(trackPath, "utf8"));
if (!track.id || !track.transcript) throw new Error("practice track must include id and transcript");
const segments = parseDialogue(track.transcript);
if (segments.length === 0) throw new Error(`track ${track.id} has no SPEAKER: text dialogue`);

const audio = await buildSectionAudio({ token: await tokenFromKey(), segments });
await fs.mkdir(outDir, { recursive: true });
const file = path.join(outDir, "track.mp3");
await fs.writeFile(file, audio.buffer);
const version = createHash("sha1").update(audio.buffer).digest("hex").slice(0, 8);
const base = (process.env.AUDIO_BASE_URL ?? "").replace(/\/+$/, "");
const src = base
  ? `${base}/practice/${track.id}/track.mp3?v=${version}`
  : `/audio/practice/${track.id}/track.mp3?v=${version}`;
await fs.writeFile(path.join(outDir, "manifest.json"), JSON.stringify({
  group: "practice",
  src,
  bitrate: audio.bitrate,
  durationSec: audio.durationSec,
  segments: audio.segments,
}, null, 2));
console.log(`generated ${track.id} (${audio.durationSec}s, ${audio.bitrate} kbps)`);