import { isAdmin } from "@/lib/auth";
import { dispatchPracticeAudio } from "@/lib/audio";
import { practiceTrackExists, setPracticeAudioStatus } from "@/lib/store";

export async function POST(request: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const form = await request.formData();
  const trackId = String(form.get("trackId") ?? "").trim();
  if (!trackId) return Response.json({ ok: false, error: "Missing trackId" }, { status: 400 });
  if (!(await practiceTrackExists(trackId))) {
    return Response.json({ ok: false, error: `No listening practice track found for "${trackId}"` }, { status: 404 });
  }

  try {
    const result = await dispatchPracticeAudio(trackId);
    if (result.ok) await setPracticeAudioStatus(trackId, "generating");
    return Response.json({ ok: result.ok, dispatched: result.ok, status: result.status ?? null, error: result.error ?? null }, { status: result.ok ? 200 : 502 });
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}