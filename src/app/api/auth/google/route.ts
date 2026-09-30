import { learnerAuthEnv, googleAuthConfigured, safeLoginReturnPath, setOAuthReturnPath, setOAuthState } from "@/lib/learner-auth";

export async function GET(request: Request) {
  const env = learnerAuthEnv();
  if (!googleAuthConfigured(env) || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_REDIRECT_URI) {
    return Response.json({ error: "Google sign-in is not configured." }, { status: 503 });
  }

  const stateBytes = crypto.getRandomValues(new Uint8Array(32));
  const state = Array.from(stateBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const returnTo = safeLoginReturnPath(new URL(request.url).searchParams.get("returnTo"));
  await setOAuthState(state);
  await setOAuthReturnPath(returnTo);

  const authorization = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorization.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  authorization.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI);
  authorization.searchParams.set("response_type", "code");
  authorization.searchParams.set("scope", "openid email profile");
  authorization.searchParams.set("state", state);
  authorization.searchParams.set("prompt", "select_account");
  return Response.redirect(authorization, 302);
}