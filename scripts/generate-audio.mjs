// Generates human-sounding CELPIP listening audio using Microsoft Edge neural
// voices (via msedge-tts). Each speaker in a dialogue gets its own voice, and
// each part is written as one MP3 file under public/audio/. A typed manifest is
// written to src/data/practice/audio-manifest.ts so the UI can highlight the
// active speaker (and the exact sentence being spoken) during playback.
//
// Run:
//   npm run audio:generate                  # all parts, 96 kbps
//   npm run audio:generate L5               # one part, 96 kbps
//   npm run audio:generate -- --bitrate=48  # everything at 48 kbps
//
// Requires network access to the Microsoft Edge Read Aloud endpoint. If the
// endpoint keeps dropping a 96 kbps stream, that segment falls back to 48 kbps.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { mock01Listening } from "../src/data/practice/mock01/listening.ts";
import { listeningTracks } from "../src/data/practice/listening.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// CBR MP3 at 48/96 kbps mono. 48 kbps = 48000 bits/s = 6000 bytes/s;
// 96 kbps = 12000 bytes/s. Each segment's duration comes from its byte length
// (exact for CBR), and every frame is verified uniform so a non-CBR response
// fails loudly instead of silently desyncing the transcript highlight.
const BYTES_PER_SECOND = { 48: 6000, 96: 12000 };
const FRAME_SIZE = { 48: 144, 96: 288 };
const OUTPUT_FORMAT_FOR = {
  48: OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
  96: OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
};

const FALLBACK_VOICE = "en-US-EmmaMultilingualNeural";

// One distinct North-American voice per speaker name, favouring the newer
// generation (Multilingual / 2024) where a matching persona exists.
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

/** Split "SPEAKER: text" transcript lines into { speaker, text } turns. */
function parseDialogue(text) {
  const segments = [];
  for (const line of text.split("\n")) {
    const match = line.match(/^([A-Z][A-Z ]*?):\s*(.*)$/);
    if (match) {
      segments.push({ speaker: match[1].trim(), text: match[2].trim() });
    } else if (segments.length && line.trim()) {
      segments[segments.length - 1].text += " " + line.trim();
    }
  }
  return segments.filter((s) => s.text.length > 0);
}

/** Collect a Readable into a Buffer. */
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

/** Decode an MPEG audio frame header into its byte length (Layer III only). */
function frameLength(header) {
  const b1 = header[1];
  const b2 = header[2];
  const version = (b1 >> 3) & 0x3; // 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5
  const layer = (b1 >> 1) & 0x3; // 1 = Layer III
  const bitrateIdx = (b2 >> 4) & 0xf;
  const srIdx = (b2 >> 2) & 0x3;
  const pad = (b2 >> 1) & 0x1;
  if (layer !== 1) throw new Error(`expected MP3 Layer III, got layer ${layer}`);
  if (bitrateIdx === 0 || bitrateIdx === 15 || srIdx === 3) {
    throw new Error("invalid MP3 frame header (free/unsupported bitrate or sample rate)");
  }
  const bitrates =
    version === 3
      ? [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
      : [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  const sampleRates =
    version === 3 ? [44100, 48000, 32000] : version === 2 ? [22050, 24000, 16000] : [11025, 12000, 8000];
  const bitrate = bitrates[bitrateIdx] * 1000;
  const sampleRate = sampleRates[srIdx];
  const samplesPerFrame = version === 3 ? 1152 : 576;
  return Math.floor((samplesPerFrame / 8) * (bitrate / sampleRate)) + pad;
}

/** Verify the buffer is uniform CBR at the requested bitrate, else throw. */
function assertCbr(buffer, bitrate) {
  const expected = FRAME_SIZE[bitrate];
  const sizes = new Set();
  let off = 0;
  let frames = 0;
  while (off < buffer.length) {
    if (off + 4 > buffer.length) throw new Error(`trailing ${buffer.length - off} bytes after ${frames} frames`);
    if (buffer[off] !== 0xff || (buffer[off + 1] & 0xe0) !== 0xe0) {
      throw new Error(`non-frame byte 0x${buffer[off].toString(16)} at offset ${off}`);
    }
    const len = frameLength(buffer.subarray(off, off + 4));
    sizes.add(len);
    frames += 1;
    off += len;
  }
  if (sizes.size !== 1 || !sizes.has(expected)) {
    throw new Error(`MP3 not uniform ${bitrate} kbps CBR: frame sizes ${[...sizes].join(",")} (expected ${expected})`);
  }
  return frames;
}

/** Drain the metadata stream and return sentence boundary entries. */
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
        /* ignore malformed metadata chunks */
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

async function synthesize(voice, text, requestedBitrate) {
  const order = requestedBitrate === 96 ? [96, 96, 96, 48] : [48, 48, 48];
  for (let attempt = 0; attempt < order.length; attempt += 1) {
    const bitrate = order[attempt];
    try {
      const { buffer, sentences } = await synthesizeOnce(voice, text, bitrate);
      return { buffer, sentences, bitrate };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (attempt === order.length - 1) throw new Error(`${voice} @${bitrate}k: ${message}`);
      console.warn(`  retry ${voice} @${bitrate}k: ${message}`);
      await sleep(1000);
    }
  }
  throw new Error(`failed: ${voice}`);
}

async function writeManifest(manifest) {
  const content =
    "// Auto-generated by scripts/generate-audio.mjs — do not edit by hand.\n" +
    "export type AudioSentence = { start: number; duration: number; text: string };\n" +
    "export type AudioSegment = { speaker: string; start: number; duration: number; sentences: AudioSentence[] };\n" +
    "export type AudioEntry = { group: string; src: string; bitrate: number; durationSec: number; segments: AudioSegment[] };\n\n" +
    `export const audioManifest: Record<string, AudioEntry> = ${JSON.stringify(manifest, null, 2)};\n`;
  await fs.writeFile(path.join(ROOT, "src", "data", "practice", "audio-manifest.ts"), content, "utf8");
}

async function main() {
  const args = process.argv.slice(2);
  const bitrateArg = args.find((a) => a.startsWith("--bitrate="));
  const requestedBitrate = bitrateArg ? Number(bitrateArg.split("=")[1]) : 96;
  const only = args.find((a) => !a.startsWith("--")) ?? null;

  if (![48, 96].includes(requestedBitrate)) {
    console.error("--bitrate must be 48 or 96");
    process.exit(1);
  }

  const parts = [
    ...mock01Listening.map((s) => ({ group: "mock01", id: s.id, text: s.passage ?? "" })),
    ...listeningTracks.map((t) => ({ group: "practice", id: t.id, text: t.transcript })),
  ].filter((p) => !only || p.id === only);

  if (parts.length === 0) {
    console.error("No parts matched. Try: npm run audio:generate [id] [--bitrate=48]");
    process.exit(1);
  }

  const manifest = {};
  const outRoot = path.join(ROOT, "public", "audio");
  const fallbackParts = [];

  for (const part of parts) {
    const segments = parseDialogue(part.text);
    if (segments.length === 0) {
      console.warn(`skip ${part.id}: no dialogue found`);
      continue;
    }

    const voiceBySpeaker = new Map();
    for (const seg of segments) {
      const v = SPEAKER_VOICES[seg.speaker] ?? FALLBACK_VOICE;
      if (voiceBySpeaker.has(v) && voiceBySpeaker.get(v) !== seg.speaker) {
        console.warn(`  warning: "${seg.speaker}" and "${voiceBySpeaker.get(v)}" share voice ${v} in ${part.id}`);
      }
      voiceBySpeaker.set(v, seg.speaker);
    }

    console.log(`${part.id}: ${segments.length} turns @ ${requestedBitrate} kbps`);
    const buffers = [];
    const segMeta = [];
    const bitratesUsed = new Set();
    let cursor = 0;
    for (let i = 0; i < segments.length; i += 1) {
      const seg = segments[i];
      const voice = SPEAKER_VOICES[seg.speaker] ?? FALLBACK_VOICE;
      const { buffer, sentences, bitrate } = await synthesize(voice, seg.text, requestedBitrate);
      assertCbr(buffer, bitrate);
      bitratesUsed.add(bitrate);
      const duration = Math.max(0.1, round(buffer.length / BYTES_PER_SECOND[bitrate], 2));
      buffers.push(buffer);
      segMeta.push({ speaker: seg.speaker, start: round(cursor, 2), duration, sentences });
      cursor += duration;
      console.log(
        `  ${String(i + 1).padStart(2, "0")} ${seg.speaker.padEnd(12)} ${voice} @${bitrate}k  ${duration}s  ${sentences.length} sentences`,
      );
      await sleep(200);
    }

    if (bitratesUsed.size > 1) fallbackParts.push(part.id);

    const file = path.join(outRoot, part.group, `${part.id}.mp3`);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, Buffer.concat(buffers));
    manifest[part.id] = {
      group: part.group,
      src: `/audio/${part.group}/${part.id}.mp3`,
      bitrate: requestedBitrate,
      durationSec: round(cursor, 2),
      segments: segMeta,
    };
    console.log(`✓ ${part.id} -> ${file} (${round(cursor, 2)}s)`);
  }

  await writeManifest(manifest);
  if (fallbackParts.length) {
    console.warn(`\nFell back to 48 kbps for: ${fallbackParts.join(", ")}`);
  }
  console.log(`\nDone. Manifest written to src/data/practice/audio-manifest.ts`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
