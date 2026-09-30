import { isAdmin } from "@/lib/auth";
import { saveVocabularyTopics } from "@/lib/store";
import { validateVocabularyTopics } from "@/data/vocabulary";

export async function POST(request: Request) {
  if (!await isAdmin()) return new Response("Unauthorized", { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Upload a JSON file using the file field." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Choose a vocabulary JSON file." }, { status: 400 });
  }
  if (file.size > 2_000_000) {
    return Response.json({ error: "File too large (max 2 MB)." }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    return Response.json({ error: "File does not contain valid JSON." }, { status: 400 });
  }

  const { topics, errors } = validateVocabularyTopics(parsed);
  if (!topics) return Response.json({ errors }, { status: 400 });

  try {
    await saveVocabularyTopics(topics);
  } catch (error) {
    console.error("[admin/vocabulary] save failed", error);
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }

  return Response.json({ ok: true, topics: topics.length, words: topics.reduce((total, topic) => total + topic.words.length, 0) });
}