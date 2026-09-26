// Loads a TypeScript module from src/ inside a plain node script.
//
// The app's modules use extensionless relative imports (`./listening`), which node's
// own type stripping cannot resolve, so bundle the graph with esbuild (already a
// build-time dependency via @opennextjs/cloudflare) and import the result.

import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

export async function loadTs(relPath) {
  let esbuild;
  try {
    esbuild = await import("esbuild");
  } catch {
    throw new Error("esbuild is required to load TypeScript sources — run `npm ci` first.");
  }

  const entry = path.join(process.cwd(), relPath);
  const result = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    target: "node22",
    logLevel: "silent",
  });
  const code = result.outputFiles[0].text;

  const tmp = path.join(
    os.tmpdir(),
    `linguaband-${process.pid}-${path.basename(relPath).replace(/\W+/g, "_")}.mjs`,
  );
  await fs.writeFile(tmp, code);
  try {
    return await import(pathToFileURL(tmp).href);
  } finally {
    await fs.rm(tmp, { force: true });
  }
}
