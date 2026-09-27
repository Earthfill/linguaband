import { isAdmin } from "@/lib/auth";
import { savePracticeSets, setPracticeAudioStatus } from "@/lib/store";
import { validatePracticeSets } from "@/lib/validate-practice-sets";
import { dispatchPracticeAudio } from "@/lib/audio";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ListeningTrack, ReadingPassage } from "@/data/practice/types";

type R2Bucket = {
  put(key: string, value: ArrayBuffer, options: { httpMetadata: { contentType: string } }): Promise<unknown>;
};

const MAX_IMAGE_SIZE = 8_000_000;
const MAX_TOTAL_IMAGE_SIZE = 20_000_000;
const IMAGE_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

export async function POST(request: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Missing JSON file." }, { status: 400 });
  if (file.size > 2_000_000) return Response.json({ error: "File too large (max 2 MB)." }, { status: 413 });

  const imageFiles = new Map<string, File>();
  let totalImageSize = 0;
  for (const entry of form.getAll("images")) {
    if (!(entry instanceof File) || entry.size === 0) continue;
    if (!Object.hasOwn(IMAGE_TYPES, entry.type)) {
      return Response.json({ error: `Unsupported image type for "${entry.name}". Use PNG, JPEG, or WebP.` }, { status: 400 });
    }
    if (entry.size > MAX_IMAGE_SIZE) {
      return Response.json({ error: `Image "${entry.name}" is too large (max 8 MB).` }, { status: 413 });
    }
    totalImageSize += entry.size;
    if (totalImageSize > MAX_TOTAL_IMAGE_SIZE) {
      return Response.json({ error: "Combined image files are too large (max 20 MB per upload)." }, { status: 413 });
    }
    if (imageFiles.has(entry.name)) {
      return Response.json({ error: `Image filename "${entry.name}" was selected more than once.` }, { status: 400 });
    }
    imageFiles.set(entry.name, entry);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    return Response.json({ error: "File does not contain valid JSON." }, { status: 400 });
  }

  const { sets, errors } = validatePracticeSets(parsed);
  if (!sets) return Response.json({ errors }, { status: 400 });

  const allSets = [...sets.listening, ...sets.reading];
  const referencedImages = new Set(allSets.flatMap((set) => set.image ? [set.image] : []));
  const missingImages = [...referencedImages].filter((name) => !imageFiles.has(name));
  if (missingImages.length) {
    return Response.json({ error: `Select the image file(s) referenced in the JSON: ${missingImages.join(", ")}.` }, { status: 400 });
  }
  const unreferencedImages = [...imageFiles.keys()].filter((name) => !referencedImages.has(name));
  if (unreferencedImages.length) {
    return Response.json({ error: `These selected images are not referenced by a listening track or reading passage: ${unreferencedImages.join(", ")}. The running app may need to be restarted or redeployed to load the latest upload handler.` }, { status: 400 });
  }

  try {
    const bucket = (getCloudflareContext().env as { BUCKET?: R2Bucket }).BUCKET;
    if (referencedImages.size && !bucket) throw new Error("R2 bucket binding is not configured.");
    for (const set of allSets) {
      if (!set.image) continue;
      const image = imageFiles.get(set.image)!;
      await bucket!.put(`practice/${set.id}/image`, await image.arrayBuffer(), { httpMetadata: { contentType: image.type } });
      set.imageUrl = `/api/practice-images/${encodeURIComponent(set.id)}`;
      if ("transcript" in set) delete (set as ListeningTrack & { image?: string }).image;
      else delete (set as ReadingPassage & { image?: string }).image;
    }
  } catch (err) {
    console.error("[admin/practice-sets] image upload failed", err);
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  try {
    await savePracticeSets(sets);
  } catch (err) {
    console.error("[admin/practice-sets] save failed", err);
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  const audioResults = await Promise.all(
    sets.listening.map(async (track) => {
      try {
        const result = await dispatchPracticeAudio(track.id);
        if (result.ok) await setPracticeAudioStatus(track.id, "generating");
        return { id: track.id, ...result };
      } catch (err) {
        return { id: track.id, ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    }),
  );

  return Response.json({
    ok: true,
    listening: sets.listening.length,
    reading: sets.reading.length,
    replacedIds: [...sets.listening, ...sets.reading].map((set) => set.id),
    audio: audioResults,
  });
}