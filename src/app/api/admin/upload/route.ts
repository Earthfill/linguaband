import { isAdmin } from "@/lib/auth";
import { existingSectionIds, saveMock, setMockStatus } from "@/lib/store";
import { validateMock } from "@/lib/validate-mock";
import type { MockExam } from "@/data/practice";

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

  const { errors, warnings } = validateMock(parsed, await existingSectionIds());
  if (errors.length > 0) {
    return Response.json({ ok: false, errors, warnings }, { status: 400 });
  }

  const exam = parsed as MockExam;
  await saveMock(exam);

  // Best-effort: ask GitHub to make the audio. If the token isn't configured the
  // mock still appears (transcript-only) and audio can be triggered later.
  const dispatched = await dispatchAudio(exam.id);
  if (dispatched) await setMockStatus(exam.id, "generating");

  return Response.json({ ok: true, warnings, dispatched });
}

async function dispatchAudio(mockId: string): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return false;
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "shilu-admin",
      },
      body: JSON.stringify({ event_type: "generate-audio", client_payload: { mockId } }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
