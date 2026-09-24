import { isAdmin } from "@/lib/auth";
import { setMockStatus } from "@/lib/store";
import { dispatchAudio } from "@/lib/audio";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const form = await request.formData();
  const mockId = String(form.get("mockId") ?? "").trim();
  if (!mockId) {
    return Response.json({ ok: false, error: "Missing mockId" }, { status: 400 });
  }

  const dispatched = await dispatchAudio(mockId);
  if (dispatched) await setMockStatus(mockId, "generating");

  return Response.json({ ok: true, dispatched });
}
