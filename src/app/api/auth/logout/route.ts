import { clearLearnerSession } from "@/lib/learner-auth";

export async function POST(request: Request) {
  await clearLearnerSession();
  if (request.headers.get("accept")?.includes("application/json")) {
    return Response.json({ ok: true }, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  }
  return Response.redirect(new URL("/writing", request.url), 303);
}