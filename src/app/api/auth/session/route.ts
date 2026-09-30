import { getLearner } from "@/lib/learner-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const learner = await getLearner();
  return Response.json(
    learner
      ? { authenticated: true, name: learner.name }
      : { authenticated: false },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}