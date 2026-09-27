import { isAdmin } from "@/lib/auth";
import { savePracticeSets } from "@/lib/store";
import { validatePracticeSets } from "@/lib/validate-practice-sets";

export async function POST(request: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Missing JSON file." }, { status: 400 });
  if (file.size > 2_000_000) return Response.json({ error: "File too large (max 2 MB)." }, { status: 413 });

  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    return Response.json({ error: "File does not contain valid JSON." }, { status: 400 });
  }

  const { sets, errors } = validatePracticeSets(parsed);
  if (!sets) return Response.json({ errors }, { status: 400 });

  try {
    await savePracticeSets(sets);
  } catch (err) {
    console.error("[admin/practice-sets] save failed", err);
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  return Response.json({
    ok: true,
    listening: sets.listening.length,
    reading: sets.reading.length,
    replacedIds: [...sets.listening, ...sets.reading].map((set) => set.id),
  });
}