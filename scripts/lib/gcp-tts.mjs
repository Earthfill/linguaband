// Shared Google Cloud Text-to-Speech helpers (no dependencies — service-account JWT + REST).
//
// Used by:
//   scripts/generate-mock-audio.mjs      — one mock from D1 → R2 (GitHub Actions)
//   scripts/gcp-audio.mjs                — hand-run voice experiments
//
// Key from GOOGLE_APPLICATION_CREDENTIALS, or .secrets/gcp-tts.json.

import { promises as fs } from "node:fs";
import path from "node:path";
import { createSign } from "node:crypto";

export const TOKEN_URL = "https://oauth2.googleapis.com/token";
export const API = "https://texttospeech.googleapis.com/v1";
export const SCOPE = "https://www.googleapis.com/auth/cloud-platform";

export const SENTENCE_PAUSE_MS = 130; // silence between sentence chunks within a turn
export const TURN_PAUSE_MS = 320; // silence between speaker turns

// Voice pools: the en-AU Chirp 3: HD voices grouped by Google's own ssmlGender
// (verified against GET /v1/voices — `node scripts/gcp-audio.mjs` prints the same
// list). Female names must pick from FEMALE_VOICES, male names from MALE_VOICES.
export const FEMALE_VOICES = [
  "en-AU-Chirp3-HD-Achernar",
  "en-AU-Chirp3-HD-Aoede",
  "en-AU-Chirp3-HD-Autonoe",
  "en-AU-Chirp3-HD-Callirrhoe",
  "en-AU-Chirp3-HD-Despina",
  "en-AU-Chirp3-HD-Erinome",
  "en-AU-Chirp3-HD-Gacrux",
  "en-AU-Chirp3-HD-Kore",
  "en-AU-Chirp3-HD-Laomedeia",
  "en-AU-Chirp3-HD-Leda",
  "en-AU-Chirp3-HD-Pulcherrima",
  "en-AU-Chirp3-HD-Sulafat",
  "en-AU-Chirp3-HD-Vindemiatrix",
  "en-AU-Chirp3-HD-Zephyr",
];
export const MALE_VOICES = [
  "en-AU-Chirp3-HD-Achird",
  "en-AU-Chirp3-HD-Algenib",
  "en-AU-Chirp3-HD-Algieba",
  "en-AU-Chirp3-HD-Alnilam",
  "en-AU-Chirp3-HD-Charon",
  "en-AU-Chirp3-HD-Enceladus",
  "en-AU-Chirp3-HD-Fenrir",
  "en-AU-Chirp3-HD-Iapetus",
  "en-AU-Chirp3-HD-Orus",
  "en-AU-Chirp3-HD-Puck",
  "en-AU-Chirp3-HD-Rasalgethi",
  "en-AU-Chirp3-HD-Sadachbia",
  "en-AU-Chirp3-HD-Sadaltager",
  "en-AU-Chirp3-HD-Schedar",
  "en-AU-Chirp3-HD-Umbriel",
  "en-AU-Chirp3-HD-Zubenelgenubi",
];

// One voice per speaker: female names get female voices, male names get male
// voices (roles without a name keep whatever suits the character). Every speaker
// sharing a section needs a *distinct* voice — `npm run audio:audit` reports
// collisions (`node scripts/audit-audio.mjs --no-head` without Cloudflare env).
export const SPEAKER_VOICES = {
  // Female names.
  AGENT: "en-AU-Chirp3-HD-Kore", // self-identifies as Priya ("this is Priya")
  PRIYA: "en-AU-Chirp3-HD-Kore", // same person as AGENT, so same voice
  MARA: "en-AU-Chirp3-HD-Aoede",
  AYESHA: "en-AU-Chirp3-HD-Aoede",
  ELENA: "en-AU-Chirp3-HD-Autonoe",
  CLIENT: "en-AU-Chirp3-HD-Autonoe", // Tamsin Lowry
  ANNOUNCER: "en-AU-Chirp3-HD-Erinome",
  ZARA: "en-AU-Chirp3-HD-Erinome",
  HOST: "en-AU-Chirp3-HD-Gacrux",
  NADIA: "en-AU-Chirp3-HD-Gacrux",
  HANNAH: "en-AU-Chirp3-HD-Laomedeia",
  RECEPTIONIST: "en-AU-Chirp3-HD-Laomedeia",
  PRIYANKA: "en-AU-Chirp3-HD-Pulcherrima",
  GRACE: "en-AU-Chirp3-HD-Sulafat",
  STYLIST: "en-AU-Chirp3-HD-Sulafat", // Renee
  BETH: "en-AU-Chirp3-HD-Vindemiatrix",
  MABEL: "en-AU-Chirp3-HD-Vindemiatrix",
  RECORDING: "en-AU-Chirp3-HD-Zephyr",
  TARA: "en-AU-Chirp3-HD-Zephyr",
  CHLOE: "en-AU-Chirp3-HD-Despina",
  DELPHINE: "en-AU-Chirp3-HD-Despina",
  LIBRARIAN: "en-AU-Chirp3-HD-Despina",
  LEAH: "en-AU-Chirp3-HD-Callirrhoe",
  MIA: "en-AU-Chirp3-HD-Achernar",
  "SPEAKER B": "en-AU-Chirp3-HD-Achernar",
  // Male names. LEE, JO, SAM and WREN are unisex — voiced male by preference.
  CUSTOMER: "en-AU-Chirp3-HD-Charon",
  FELIX: "en-AU-Chirp3-HD-Enceladus",
  MARCUS: "en-AU-Chirp3-HD-Schedar",
  NOAH: "en-AU-Chirp3-HD-Algenib",
  OWEN: "en-AU-Chirp3-HD-Algenib",
  OMAR: "en-AU-Chirp3-HD-Algieba",
  RAVI: "en-AU-Chirp3-HD-Sadaltager",
  DEV: "en-AU-Chirp3-HD-Iapetus",
  IAN: "en-AU-Chirp3-HD-Iapetus",
  LEE: "en-AU-Chirp3-HD-Rasalgethi",
  OTIS: "en-AU-Chirp3-HD-Sadachbia",
  TOM: "en-AU-Chirp3-HD-Puck",
  SAM: "en-AU-Chirp3-HD-Orus",
  WREN: "en-AU-Chirp3-HD-Zubenelgenubi",
  JO: "en-AU-Chirp3-HD-Achird",
  "SPEAKER A": "en-AU-Chirp3-HD-Puck",
  // Roles without a fixed name.
  CALLER: "en-AU-Chirp3-HD-Fenrir",
  "NEWS READER": "en-AU-Chirp3-HD-Orus",
  COORDINATOR: "en-AU-Chirp3-HD-Alnilam",
  MANAGER: "en-AU-Chirp3-HD-Alnilam",
  "CAFE OWNER": "en-AU-Chirp3-HD-Umbriel",
  STUDENT: "en-AU-Chirp3-HD-Achird",
};

// Names not yet in SPEAKER_VOICES still get a gender-correct voice from the
// matching pool instead of the fallback. Unisex names are listed under the
// gender they should be voiced with.
export const NAME_GENDER = {
  AYESHA: "female",
  BETH: "female",
  CHLOE: "female",
  DANIEL: "male",
  DELPHINE: "female",
  DEV: "male",
  ELENA: "female",
  FELIX: "male",
  GRACE: "female",
  HANNAH: "female",
  IAN: "male",
  JO: "male",
  LEE: "male",
  LEAH: "female",
  MABEL: "female",
  MARA: "female",
  MARCUS: "male",
  MIA: "female",
  NADIA: "female",
  NOAH: "male",
  OMAR: "male",
  OTIS: "male",
  OWEN: "male",
  PRIYA: "female",
  PRIYANKA: "female",
  RAVI: "male",
  RENEE: "female",
  SAM: "male",
  TAMSIN: "female",
  TOM: "male",
  TARA: "female",
  WREN: "male",
  ZARA: "female",
};

export const FALLBACK_VOICE = "en-AU-Chirp3-HD-Kore";

const hashName = (name) => {
  let h = 5381;
  for (let i = 0; i < name.length; i++) h = ((h << 5) + h + name.charCodeAt(i)) | 0;
  return h >>> 0;
};

/** Voice for a speaker: explicit mapping, else a stable pick from the name's gender pool, else the fallback. */
export function voiceForSpeaker(speaker) {
  const explicit = SPEAKER_VOICES[speaker];
  if (explicit) return explicit;
  const gender = NAME_GENDER[speaker];
  if (gender === "female") return FEMALE_VOICES[hashName(speaker) % FEMALE_VOICES.length];
  if (gender === "male") return MALE_VOICES[hashName(speaker) % MALE_VOICES.length];
  return FALLBACK_VOICE;
}

export const round = (value, dp = 2) => {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
};
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ----------------------------- Google auth ----------------------------- */

export function b64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function keyPath() {
  return (
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() ||
    path.join(process.cwd(), ".secrets", "gcp-tts.json")
  );
}

/** Read + validate the service-account JSON (throws a readable error). */
export async function readKey() {
  const p = keyPath();
  const key = JSON.parse(await fs.readFile(p, "utf8"));
  if (!key.client_email || !key.private_key) throw new Error(`bad service-account key at ${p}`);
  return key;
}

export async function accessToken(key) {
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

/** OAuth token straight from the local/CI service-account key. */
export async function tokenFromKey() {
  return accessToken(await readKey());
}

/* ------------------------------ text helpers ------------------------------ */

/** `SPEAKER: text` lines → one segment per speaker turn (wrapped lines are merged). */
export function parseDialogue(text) {
  const segments = [];
  for (const line of String(text ?? "").split("\n")) {
    const m = line.match(/^([A-Z][A-Z ]*?):\s*(.*)$/);
    if (m) segments.push({ speaker: m[1].trim(), text: m[2].trim() });
    else if (segments.length && line.trim()) segments[segments.length - 1].text += " " + line.trim();
  }
  return segments.filter((s) => s.text.length > 0);
}

// Google caps one request at 5000 bytes and short utterances sound better, so
// split each speaker turn into sentence-sized chunks.
export function splitSentences(text, max = 380) {
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
export function frameLength(header) {
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

export function frameInfo(header) {
  const version = (header[1] >> 3) & 0x3;
  return {
    sampleRate: (SAMPLE_RATES[version] ?? SAMPLE_RATES[2])[(header[2] >> 2) & 0x3],
    samplesPerFrame: version === 3 ? 1152 : 576,
    bitrate: (BITRATES[version] ?? BITRATES[2])[(header[2] >> 4) & 0xf] ?? 0,
  };
}

/** Exact duration (seconds) of a CBR MP3 buffer. */
export function mp3Duration(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff) return buffer.length / 4000;
  const header = buffer.subarray(0, 4);
  const { sampleRate, samplesPerFrame } = frameInfo(header);
  return (Math.floor(buffer.length / frameLength(header)) * samplesPerFrame) / sampleRate;
}

/** `ms` milliseconds of silence matching the codec of `refHeader`. */
export function silence(refHeader, ms) {
  const frameSize = frameLength(refHeader);
  const { sampleRate, samplesPerFrame } = frameInfo(refHeader);
  const frames = Math.max(1, Math.round((ms / 1000) * (sampleRate / samplesPerFrame)));
  const frame = Buffer.concat([refHeader, Buffer.alloc(frameSize - 4)]);
  const out = Buffer.alloc(frameSize * frames);
  for (let i = 0; i < frames; i++) frame.copy(out, i * frameSize);
  return out;
}

/** 4-byte frame header copied from a real buffer, with the padding bit cleared. */
export function headerOf(buffer) {
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

export async function synthesize(token, voice, text, attempts = 4) {
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

/* --------------------------- whole-section audio --------------------------- */

/**
 * Synthesize one dialogue section: one voice per speaker, sentence chunks joined
 * with short silences, turns separated by a longer pause.
 *
 * Returns `{ buffer, durationSec, bitrate, segments }` where `segments` carries
 * per-speaker and per-sentence timings the UI uses to highlight the transcript.
 */
export async function buildSectionAudio({ token, segments, onChunk }) {
  const buffers = [];
  const segMeta = [];
  let cursor = 0;
  let header = null;

  for (let si = 0; si < segments.length; si++) {
    const seg = segments[si];
    const voice = voiceForSpeaker(seg.speaker);
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
      if (onChunk) onChunk();
      await sleep(110);
    }
    if (header && si < segments.length - 1) {
      const gap = silence(header, TURN_PAUSE_MS);
      buffers.push(gap);
      local += mp3Duration(gap);
    }
    segMeta.push({
      speaker: seg.speaker,
      start: round(segStart, 2),
      duration: round(local, 2),
      sentences,
    });
    cursor = segStart + local;
  }

  return {
    buffer: Buffer.concat(buffers),
    durationSec: round(cursor, 2),
    bitrate: header ? frameInfo(header).bitrate : 0,
    segments: segMeta,
  };
}
