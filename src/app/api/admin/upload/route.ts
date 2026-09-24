import { isAdmin } from "@/lib/auth";
import { existingSectionIds, saveMock, setMockStatus } from "@/lib/store";
import { validateMock } from "@/lib/validate-mock";
import type { MockExam } from "@/data/practice";
import { dispatchAudio } from "@/lib/audio";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return new Response("Missing file", { status: 400 });
  }
  if (file.size > 2_000_000) {
    return new Response("File too large (max 2 MB)", { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    return new Response("Not valid JSON", { status: 400 });
  }

  const exam = parsed as MockExam;
  // Exclude this mock's own sections so an update or re-upload is not flagged as a collision.
  const { errors, warnings } = validateMock(parsed, await existingSectionIds(exam.id));
  if (errors.length > 0) {
    return Response.json({ ok: false, errors, warnings }, { status: 400 });
  }

  try {
    await saveMock(exam);
  } catch (err) {
    console.error("[admin/upload] saveMock failed", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }

  // Best-effort: ask GitHub to make the audio. If the token isn't configured the
  // mock still appears (transcript-only) and audio can be triggered later.
  const result = await dispatchAudio(exam.id);
  if (result.ok) await setMockStatus(exam.id, "generating");

  return Response.json({
    ok: true,
    warnings,
    dispatched: result.ok,
    status: result.status ?? null,
    error: result.error ?? null,
  });
}
