// Google Cloud Text-to-Speech helper (no dependencies — service-account JWT + REST).
// Key from GOOGLE_APPLICATION_CREDENTIALS, or .secrets/gcp-tts.json.
//   node scripts/gcp-audio.mjs                       # list en-CA + Chirp3-HD voices
//   node scripts/gcp-audio.mjs <voice> [<voice>...]  # synth the M2L2 sample per voice
import { promises as fs } from "node:fs";
import path from "node:path";
import { createSign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://texttospeech.googleapis.com/v1";

function b64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function readKey() {
  const p = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() || path.join(process.cwd(), ".secrets", "gcp-tts.json");
  try {
    const key = JSON.parse(await fs.readFile(p, "utf8"));
    if (!key.client_email || !key.private_key) throw new Error("missing fields");
    return key;
  } catch {
    console.error(`Missing/invalid Google service-account key. Expected at:\n  ${p}\n(or set GOOGLE_APPLICATION_CREDENTIALS).`);
    process.exit(1);
  }
}

async function accessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
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
  if (!res.ok || !data.access_token) throw new Error(`token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function listVoices(token) {
  const res = await fetch(`${API}/voices`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  const voices = data.voices ?? [];
  const ca = voices.filter((v) => (v.languageCodes ?? []).some((l) => l.startsWith("en-CA")));
  const hd = voices.filter((v) => /Chirp3?-HD/i.test(v.name ?? "") && (v.languageCodes ?? []).some((l) => l.startsWith("en-")));
  console.log("=== en-CA voices ===");
  for (const v of ca) console.log(`  ${v.name}  (${v.ssmlGender})`);
  if (!ca.length) console.log("  (none)");
  console.log("\n=== Chirp 3: HD voices (English) ===");
  for (const v of hd) console.log(`  ${v.name}  (${v.ssmlGender})  [${(v.languageCodes ?? []).join(",")}]`);
  if (!hd.length) console.log("  (none)");
}

async function synthesize(token, voice, text) {
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
  if (!res.ok) throw new Error(JSON.stringify(data));
  return Buffer.from(data.audioContent ?? "", "base64");
}

async function main() {
  const key = await readKey();
  const token = await accessToken(key);
  const voices = process.argv.slice(2);
  if (!voices.length) return listVoices(token);

  const mock = JSON.parse(await fs.readFile(path.join(process.cwd(), "scripts", "sample-mock-02.json"), "utf8"));
  const section = mock.sections.find((s) => s.id === "M2L2");
  const text = section.passage.replace(/^[A-Z][A-Z ]*?:/gm, "").trim();
  const outDir = path.join(process.cwd(), "public", "audio", "_compare");
  await fs.mkdir(outDir, { recursive: true });
  for (let i = 0; i < voices.length; i++) {
    process.stdout.write(`\nsynthesizing ${voices[i]} ... `);
    const buf = await synthesize(token, voices[i], text);
    const file = path.join(outDir, `G-${i + 1}-${voices[i]}.mp3`);
    await fs.writeFile(file, buf);
    console.log(`-> ${(buf.length / 1024).toFixed(0)} KB -> ${file}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
