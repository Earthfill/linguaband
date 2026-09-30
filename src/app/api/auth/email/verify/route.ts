import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { learnerAuthEnv } from "@/lib/learner-auth";
import { verifyLearnerEmail } from "@/lib/learner-email";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  let db = learnerAuthEnv().DB;
  if (!db) {
    try {
      db = ((await getCloudflareContext({ async: true })).env as unknown as { DB?: typeof db }).DB;
    } catch {
      // The app below returns a generic failure if the runtime binding is unavailable.
    }
  }
  if (!db) return NextResponse.redirect(new URL("/login?error=verification", url), 303);

  try {
    const verified = await verifyLearnerEmail(db, token);
    return NextResponse.redirect(
      new URL(verified ? "/login?verified=1" : "/login?error=verification", url),
      303,
    );
  } catch (error) {
    console.error("[email-auth] verification failed", error);
    return NextResponse.redirect(new URL("/login?error=verification", url), 303);
  }
}