// Generates listening audio for ONE uploaded mock (called from GitHub Actions).
// Reads a mock JSON file, synthesizes each listening section, writes one MP3 per
// section into <outdir>, and emits <outdir>/manifest.json (an audio map keyed by
// section id, with full `src` URLs).
//
// Usage: node scripts/generate-mock-audio.mjs <mock.json> <outdir>
// Env:    AUDIO_BASE_URL (optional) public prefix for the MP3s, e.g. https://audio.example.com
//
// Keep the voices + synthesis behaviour in sync with scripts/generate-audio.mjs.

import { promises as fs } from "node:fs";
import path from "node:path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const BYTES_PER_SECOND = { 48: 6000, 96: 12000 };
const OUTPUT_FORMAT_FOR = {
  48: OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
  96: OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
};

const FALLBACK_VOICE = "en-US-AriaNeural";
const STABLE_FALLBACK = "en-US-AriaNeural";
const SPEAKER_VOICES = {
  AGENT: "en-CA-ClaraNeural",
  CUSTOMER: "en-CA-LiamNeural",
  LEE: "en-US-AvaMultilingualNeural",
  MARA: "en-US-EmmaMultilingualNeural",
  ANNOUNCER: "en-US-AvaNeural",
  "NEWS READER": "en-US-AndrewMultilingualNeural",
  HOST: "en-CA-ClaraNeural",
  ELENA: "en-US-EmmaNeural",
  MARCUS: "en-US-BrianMultilingualNeural",
  "SPEAKER A": "en-US-AndrewNeural",
  "SPEAKER B": "en-US-BrianNeural",
};

const round = (value, dp = 2) => {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseDialogue(text) {
  const segments = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z][A-Z ]*?):\s*(.*)$/);
    if (m) segments.push({ speaker: m[1].trim(), text: m[2].trim() });
    else if (segments.length && line.trim()) segments[segments.length - 1].text += " " + line.trim();
  }
  return segments.filter((s) => s.text.length > 0);
}

// Long single TTS calls are where Edge's stream gets cut off ("no turn.end
// received"), so split each speaker turn into sentence-sized chunks first.
function splitSentences(text, max = 380) {
  const raw = text.match(/[^.!?]*[.!?]+["')\]]*|[^.!?]+$/g) ?? [text];
  const chunks = [];
  let cur = "";
  for (const part of raw) {
    if (cur && (cur + part).length > max) {
      if (cur.trim()) chunks.push(cur.trim());
      cur = part;
    } else {
      cur += part;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());

  // Hard-split anything still too long (no sentence punctuation).
  const out = [];
  for (const c of chunks) {
    if (c.length <= max) {
      out.push(c);
      continue;
    }
    let rest = c;
    while (rest.length > max) {
      let cut = rest.lastIndexOf(" ", max);
      if (cut < max * 0.6) cut = max;
      out.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) out.push(rest);
  }
  return out.filter(Boolean);
}

function collect(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve(Buffer.concat(chunks));
    };
    stream.on("data", (d) => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)));
    stream.once("end", finish);
    stream.once("close", finish);
    stream.once("error", (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });
  });
}

function collectMetadata(metadataStream) {
  return new Promise((resolve) => {
    if (!metadataStream) return resolve([]);
    const items = [];
    let timer;
    const finish = () => {
      if (timer) clearTimeout(timer);
      resolve(items);
    };
    metadataStream.on("data", (d) => {
      try {
        items.push(...(JSON.parse(d.toString()).Metadata ?? []));
      } catch {
        /* ignore malformed chunks */
      }
    });
    metadataStream.once("close", finish);
    metadataStream.once("error", finish);
    metadataStream.once("end", finish);
    timer = setTimeout(finish, 2000);
  });
}

function parseSentences(items) {
  return items
    .filter((m) => m?.Type === "SentenceBoundary" && m?.Data)
    .map((m) => ({
      start: round(m.Data.Offset / 1e7, 3),
      duration: round(m.Data.Duration / 1e7, 3),
      text: (m.Data.text?.Text ?? "").trim(),
    }))
    .filter((s) => s.text.length > 0);
}

async function synthesizeOnce(voice, text, bitrate) {
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT_FOR[bitrate], { sentenceBoundaryEnabled: true });
    const { audioStream, metadataStream } = tts.toStream(text, { rate: 1.0 });
    const metaPromise = collectMetadata(metadataStream);
    const buffer = await collect(audioStream);
    const items = await metaPromise;
    tts.close();
    return { buffer, sentences: parseSentences(items) };
  } catch (err) {
    tts.close();
    throw err;
  }
}

async function synthesize(voice, text) {
  let lastMessage = "";
  for (let attempt = 0; attempt < 3; attempt += 1) {
    for (const bitrate of [96, 48]) {
      try {
        const { buffer, sentences } = await synthesizeOnce(voice, text, bitrate);
        return { buffer, sentences, bitrate };
      } catch (err) {
        lastMessage = err instanceof Error ? err.message : String(err);
        console.warn(`  retry ${voice} @${bitrate}k (attempt ${attempt + 1}/3): ${lastMessage}`);
        await sleep(600 * (attempt + 1));
      }
    }
  }
  // Last resort: a very stable voice so one flaky voice never sinks a whole mock.
  if (voice !== STABLE_FALLBACK) {
    try {
      const { buffer, sentences } = await synthesizeOnce(STABLE_FALLBACK, text, 48);
      console.warn(`  fallback ${voice} -> ${STABLE_FALLBACK} @48k`);
      return { buffer, sentences, bitrate: 48 };
    } catch (err) {
      lastMessage = err instanceof Error ? err.message : String(err);
    }
  }
  throw new Error(`synthesis failed for ${voice}: ${lastMessage}`);
}

async function main() {
  const [mockPath, outDir] = process.argv.slice(2);
  if (!mockPath || !outDir) {
    console.error("usage: node scripts/generate-mock-audio.mjs <mock.json> <outdir>");
    process.exit(1);
  }
  const mock = JSON.parse(await fs.readFile(mockPath, "utf8"));
  const base = (process.env.AUDIO_BASE_URL ?? "").replace(/\/+$/, "");
  await fs.mkdir(outDir, { recursive: true });

  const manifest = {};
  for (const section of mock.sections ?? []) {
    if (section.skill !== "listening" || !section.passage) continue;
    const segments = parseDialogue(section.passage);
    if (segments.length === 0) {
      console.warn(`skip ${section.id}: no dialogue`);
      continue;
    }
    const buffers = [];
    const segMeta = [];
    let cursor = 0;
    let sectionBitrate = 96;
    for (const seg of segments) {
      const voice = SPEAKER_VOICES[seg.speaker] ?? FALLBACK_VOICE;
      const segStart = cursor;
      const sentences = [];
      let local = 0; // seconds offset within this segment
      for (const chunk of splitSentences(seg.text)) {
        const { buffer, sentences: rawSentences, bitrate } = await synthesize(voice, chunk);
        if (bitrate === 48) sectionBitrate = 48;
        const duration = Math.max(0.1, round(buffer.length / BYTES_PER_SECOND[bitrate], 2));
        if (rawSentences.length > 0) {
          for (const s of rawSentences) {
            sentences.push({ start: round(local + s.start, 2), duration: round(s.duration, 2), text: s.text });
          }
        } else {
          sentences.push({ start: round(local, 2), duration, text: chunk });
        }
        buffers.push(buffer);
        local += duration;
        await sleep(120);
      }
      segMeta.push({ speaker: seg.speaker, start: round(segStart, 2), duration: round(local, 2), sentences });
      cursor = segStart + local;
    }
    const file = path.join(outDir, `${section.id}.mp3`);
    await fs.writeFile(file, Buffer.concat(buffers));
    const src = base ? `${base}/${mock.id}/${section.id}.mp3` : `/audio/${mock.id}/${section.id}.mp3`;
    manifest[section.id] = {
      group: mock.id,
      src,
      bitrate: sectionBitrate,
      durationSec: round(cursor, 2),
      segments: segMeta,
    };
    console.log(`✓ ${section.id} -> ${file} (${round(cursor, 2)}s)`);
  }

  await fs.writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("manifest.json written");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
