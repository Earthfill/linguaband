// Generates listening audio for ONE uploaded mock (called from GitHub Actions).
// Synthesizes each listening section with Google Cloud Text-to-Speech (Chirp 3: HD),
// writes one MP3 per section into <outdir>, and emits <outdir>/manifest.json
// (an audio map keyed by section id, with full `src` URLs).
//
// Usage: node scripts/generate-mock-audio.mjs <mock.json> <outdir>
// Env:   AUDIO_BASE_URL                  public prefix for the MP3s
//        GOOGLE_APPLICATION_CREDENTIALS  path to the service-account JSON
//                                        (falls back to .secrets/gcp-tts.json)

import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash, createSign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://texttospeech.googleapis.com/v1";
const SCOPE = "https://www.googleapis.com/auth/cloud-platform";

const SENTENCE_PAUSE_MS = 130; // silence between sentence chunks within a turn
const TURN_PAUSE_MS = 320; // silence between speaker turns

// One distinct en-US Chirp 3: HD voice per speaker role.
const SPEAKER_VOICES = {
  AGENT: "en-US-Chirp3-HD-Kore",
  CUSTOMER: "en-US-Chirp3-HD-Charon",
  LEE: "en-US-Chirp3-HD-Leda",
  MARA: "en-US-Chirp3-HD-Aoede",
  ANNOUNCER: "en-US-Chirp3-HD-Erinome",
  "NEWS READER": "en-US-Chirp3-HD-Orus",
  HOST: "en-US-Chirp3-HD-Gacrux",
  ELENA: "en-US-Chirp3-HD-Autonoe",
  MARCUS: "en-US-Chirp3-HD-Schedar",
  "SPEAKER A": "en-US-Chirp3-HD-Puck",
  "SPEAKER B": "en-US-Chirp3-HD-Zubenelgenubi",
};
const FALLBACK_VOICE = "en-US-Chirp3-HD-Kore";

const round = (value, dp = 2) => {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ----------------------------- Google auth ----------------------------- */

function b64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function readKey() {
  const p =
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() ||
    path.join(process.cwd(), ".secrets", "gcp-tts.json");
  const key = JSON.parse(await fs.readFile(p, "utf8"));
  if (!key.client_email || !key.private_key) throw new Error(`bad service-account key at ${p}`);
  return key;
}

async function accessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(
    JSON.stringify({ iss: key.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  )}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  const jwt = `${unsigned}.${b64url(sign.sign(key.private_key))}`;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error(`auth failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

/* ------------------------------ text helpers ------------------------------ */

function parseDialogue(text) {
  const segments = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z][A-Z ]*?):\s*(.*)$/);
    if (m) segments.push({ speaker: m[1].trim(), text: m[2].trim() });
    else if (segments.length && line.trim()) segments[segments.length - 1].text += " " + line.trim();
  }
  return segments.filter((s) => s.text.length > 0);
}

// Google caps one request at 5000 bytes and short utterances sound better, so
// split each speaker turn into sentence-sized chunks.
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

/* ------------------------------ mp3 utilities ------------------------------ */

const BITRATES = {
  3: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};
const SAMPLE_RATES = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

/** Byte length of one Layer III frame from its 4-byte header. */
function frameLength(header) {
  const version = (header[1] >> 3) & 0x3;
  const layer = (header[1] >> 1) & 0x3;
  const bitrateIdx = (header[2] >> 4) & 0xf;
  const srIdx = (header[2] >> 2) & 0x3;
  const pad = (header[2] >> 1) & 0x1;
  if (layer !== 1) throw new Error(`expected MP3 Layer III, got layer ${layer}`);
  if (bitrateIdx === 0 || bitrateIdx === 15 || srIdx === 3) throw new Error("invalid MP3 frame header");
  const bitrate = (BITRATES[version] ?? BITRATES[2])[bitrateIdx] * 1000;
  const sampleRate = (SAMPLE_RATES[version] ?? SAMPLE_RATES[2])[srIdx];
  const samplesPerFrame = version === 3 ? 1152 : 576;
  return Math.floor((samplesPerFrame / 8) * (bitrate / sampleRate)) + pad;
}

function frameInfo(header) {
  const version = (header[1] >> 3) & 0x3;
  return {
    sampleRate: (SAMPLE_RATES[version] ?? SAMPLE_RATES[2])[(header[2] >> 2) & 0x3],
    samplesPerFrame: version === 3 ? 1152 : 576,
    bitrate: (BITRATES[version] ?? BITRATES[2])[(header[2] >> 4) & 0xf] ?? 0,
  };
}

/** Exact duration (seconds) of a CBR MP3 buffer. */
function mp3Duration(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff) return buffer.length / 4000;
  const header = buffer.subarray(0, 4);
  const { sampleRate, samplesPerFrame } = frameInfo(header);
  return (Math.floor(buffer.length / frameLength(header)) * samplesPerFrame) / sampleRate;
}

/** `ms` milliseconds of silence matching the codec of `refHeader`. */
function silence(refHeader, ms) {
  const frameSize = frameLength(refHeader);
  const { sampleRate, samplesPerFrame } = frameInfo(refHeader);
  const frames = Math.max(1, Math.round((ms / 1000) * (sampleRate / samplesPerFrame)));
  const frame = Buffer.concat([refHeader, Buffer.alloc(frameSize - 4)]);
  const out = Buffer.alloc(frameSize * frames);
  for (let i = 0; i < frames; i++) frame.copy(out, i * frameSize);
  return out;
}

/** 4-byte frame header copied from a real buffer, with the padding bit cleared. */
function headerOf(buffer) {
  const h = Buffer.from([buffer[0], buffer[1], buffer[2] & 0xfd, buffer[3]]);
  frameLength(h); // throws if this isn't a valid MP3 frame
  return h;
}

/* ------------------------------- synthesis ------------------------------- */

async function synthOnce(token, voice, text) {
  const res = await fetch(`${API}/text:synthesize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: voice.split("-").slice(0, 2).join("-"), name: voice },
      audioConfig: { audioEncoding: "MP3" },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(data)}`);
  return Buffer.from(data.audioContent ?? "", "base64");
}

async function synthesize(token, voice, text, attempts = 4) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      return await synthOnce(token, voice, text);
    } catch (err) {
      last = err;
      const m = err instanceof Error ? err.message : String(err);
      console.warn(`  retry ${voice} (${i + 1}/${attempts}): ${m}`);
      await sleep(700 * (i + 1));
    }
  }
  if (voice !== FALLBACK_VOICE) {
    try {
      console.warn(`  fallback ${voice} -> ${FALLBACK_VOICE}`);
      return await synthOnce(token, FALLBACK_VOICE, text);
    } catch (err) {
      last = err;
    }
  }
  throw last;
}

/* ---------------------------------- main ---------------------------------- */

async function main() {
  const [mockPath, outDir] = process.argv.slice(2);
  if (!mockPath || !outDir) {
    console.error("usage: node scripts/generate-mock-audio.mjs <mock.json> <outdir>");
    process.exit(1);
  }
  const token = await accessToken(await readKey());
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
    let header = null;
    process.stdout.write(`${section.id} `);
    for (let si = 0; si < segments.length; si++) {
      const seg = segments[si];
      const voice = SPEAKER_VOICES[seg.speaker] ?? FALLBACK_VOICE;
      const segStart = cursor;
      const sentences = [];
      let local = 0;
      const chunks = splitSentences(seg.text);
      for (let ci = 0; ci < chunks.length; ci++) {
        const buffer = await synthesize(token, voice, chunks[ci]);
        if (!header) header = headerOf(buffer);
        const duration = round(mp3Duration(buffer), 2);
        sentences.push({ start: round(local, 2), duration, text: chunks[ci] });
        buffers.push(buffer);
        local += duration;
        if (ci < chunks.length - 1) {
          const gap = silence(header, SENTENCE_PAUSE_MS);
          buffers.push(gap);
          local += mp3Duration(gap);
        }
        process.stdout.write(".");
        await sleep(110);
      }
      if (header && si < segments.length - 1) {
        const gap = silence(header, TURN_PAUSE_MS);
        buffers.push(gap);
        local += mp3Duration(gap);
      }
      segMeta.push({ speaker: seg.speaker, start: round(segStart, 2), duration: round(local, 2), sentences });
      cursor = segStart + local;
    }
    const file = path.join(outDir, `${section.id}.mp3`);
    const out = Buffer.concat(buffers);
    await fs.writeFile(file, out);
    // Content hash in the URL so a re-generation is never masked by a cached copy.
    const version = createHash("sha1").update(out).digest("hex").slice(0, 8);
    const src = base
      ? `${base}/${mock.id}/${section.id}.mp3?v=${version}`
      : `/audio/${mock.id}/${section.id}.mp3?v=${version}`;
    manifest[section.id] = {
      group: mock.id,
      src,
      bitrate: header ? frameInfo(header).bitrate : 0,
      durationSec: round(cursor, 2),
      segments: segMeta,
    };
    console.log(` -> ${file} (${round(cursor, 2)}s)`);
  }

  await fs.writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("manifest.json written");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
