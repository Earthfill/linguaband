import { clearLearnerSession } from "@/lib/learner-auth";

export async function POST(request: Request) {
  await clearLearnerSession();
  return Response.redirect(new URL("/writing", request.url), 303);
}