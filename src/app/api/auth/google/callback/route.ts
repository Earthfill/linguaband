import { learnerAuthEnv, consumeOAuthReturnPath, consumeOAuthState, googleAuthConfigured, setLearnerSession } from "@/lib/learner-auth";

type GoogleTokenResponse = { access_token?: string; error?: string };
type GoogleUserInfo = { sub?: string; email?: string; name?: string; email_verified?: boolean };

export async function GET(request: Request) {
  const env = learnerAuthEnv();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (url.searchParams.has("error") || !code || !state || !await consumeOAuthState(state)) {
    await consumeOAuthReturnPath();
    return Response.redirect(new URL("/login?error=google", url), 303);
  }
  if (!googleAuthConfigured(env) || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
    await consumeOAuthReturnPath();
    return Response.redirect(new URL("/login?error=google-config", url), 303);
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const token = await tokenResponse.json() as GoogleTokenResponse;
    if (!tokenResponse.ok || !token.access_token) throw new Error("Google token exchange failed");

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const profile = await profileResponse.json() as GoogleUserInfo;
    if (!profileResponse.ok || !profile.sub || !profile.email || profile.email_verified !== true) {
      throw new Error("Google profile could not be verified");
    }

    await setLearnerSession({ id: profile.sub, email: profile.email, name: profile.name || profile.email });
    return Response.redirect(new URL(await consumeOAuthReturnPath(), url), 303);
  } catch (error) {
    console.error("[google-auth] sign-in failed", error);
    await consumeOAuthReturnPath();
    return Response.redirect(new URL("/login?error=google", url), 303);
  }
}