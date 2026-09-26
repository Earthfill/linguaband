// Google Cloud Text-to-Speech helper for hand-run experiments.
// Key from GOOGLE_APPLICATION_CREDENTIALS, or .secrets/gcp-tts.json.
//   node scripts/gcp-audio.mjs                       # list en-CA + Chirp3-HD voices
//   node scripts/gcp-audio.mjs <voice> [<voice>...]  # synth the M2L2 sample per voice

import { promises as fs } from "node:fs";
import path from "node:path";
import { API, FALLBACK_VOICE, synthesize, tokenFromKey } from "./lib/gcp-tts.mjs";

async function listVoices(token) {
  const res = await fetch(`${API}/voices`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  const voices = data.voices ?? [];
  const ca = voices.filter((v) => (v.languageCodes ?? []).some((l) => l.startsWith("en-CA")));
  const hd = voices.filter(
    (v) => /Chirp3?-HD/i.test(v.name ?? "") && (v.languageCodes ?? []).some((l) => l.startsWith("en-")),
  );
  console.log("=== en-CA voices ===");
  for (const v of ca) console.log(`  ${v.name}  (${v.ssmlGender})`);
  if (!ca.length) console.log("  (none)");
  console.log("\n=== Chirp 3: HD voices (English) ===");
  for (const v of hd) console.log(`  ${v.name}  (${v.ssmlGender})  [${(v.languageCodes ?? []).join(",")}]`);
  if (!hd.length) console.log("  (none)");
}

async function main() {
  const token = await tokenFromKey();
  const voices = process.argv.slice(2);
  if (!voices.length) return listVoices(token);

  const mock = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "scripts", "sample-mock-02.json"), "utf8"),
  );
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
  console.log(`\n(fallback voice is ${FALLBACK_VOICE})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
