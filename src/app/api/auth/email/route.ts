import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import {
  hashPassword,
  learnerAuthEnv,
  safeLoginReturnPath,
  setLearnerSession,
  verifyPassword,
  type Learner,
} from "@/lib/learner-auth";

type AuthDatabase = NonNullable<ReturnType<typeof learnerAuthEnv>["DB"]>;
const MAX_AUTH_ATTEMPTS = 10;
const AUTH_WINDOW_SECONDS = 15 * 60;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function database(): Promise<AuthDatabase | null> {
  try {
    return ((await getCloudflareContext({ async: true })).env as unknown as { DB?: AuthDatabase }).DB ?? null;
  } catch {
    return learnerAuthEnv().DB ?? null;
  }
}

async function rateLimit(db: AuthDatabase, request: Request): Promise<boolean> {
  const secret = learnerAuthEnv().LEARNER_SESSION_SECRET;
  const clientIp = request.headers.get("cf-connecting-ip") ?? "local-development";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${secret}:${clientIp}`));
  const key = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / AUTH_WINDOW_SECONDS) * AUTH_WINDOW_SECONDS;
  const result = await db.prepare(
    "INSERT INTO learner_auth_attempts (ip_hash, window_start, attempt_count) VALUES (?, ?, 1) " +
    "ON CONFLICT(ip_hash) DO UPDATE SET window_start = excluded.window_start, " +
    "attempt_count = CASE WHEN learner_auth_attempts.window_start = excluded.window_start " +
    "THEN learner_auth_attempts.attempt_count + 1 ELSE 1 END RETURNING attempt_count",
  ).bind(key, windowStart).first<{ attempt_count: number }>();
  return Boolean(result && result.attempt_count <= MAX_AUTH_ATTEMPTS);
}

export async function POST(request: Request) {
  const env = learnerAuthEnv();
  if (!env.LEARNER_SESSION_SECRET) return jsonError("Email sign-in is not configured yet.", 503);
  const db = await database();
  if (!db) return jsonError("Account storage is not configured. Apply the learner account migration and try again.", 503);

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 4_000) return jsonError("Request is too large.", 413);
    body = JSON.parse(raw);
  } catch {
    return jsonError("Enter a valid email and password.", 400);
  }
  if (!body || typeof body !== "object") return jsonError("Enter a valid email and password.", 400);

  const input = body as Record<string, unknown>;
  const mode = input.mode;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  const returnTo = safeLoginReturnPath(typeof input.returnTo === "string" ? input.returnTo : null);
  if (mode !== "login" && mode !== "register") return jsonError("Choose sign in or create account.", 400);
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("Enter a valid email address.", 400);
  if (mode === "register" && (password.length < 12 || password.length > 128)) {
    return jsonError("Choose a password between 12 and 128 characters.", 400);
  }
  if (mode === "login" && (!password || password.length > 128)) return jsonError("Enter your password.", 400);

  try {
    if (!await rateLimit(db, request)) return jsonError("Too many attempts. Please wait 15 minutes before trying again.", 429);

    if (mode === "register") {
      const account: Learner = {
        id: crypto.randomUUID(),
        email,
        name: email.split("@")[0],
      };
      const passwordHash = await hashPassword(password);
      const created = await db.prepare(
        "INSERT INTO learner_accounts (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?) " +
        "ON CONFLICT(email) DO NOTHING RETURNING id, email, name",
      ).bind(account.id, account.email, account.name, passwordHash, Math.floor(Date.now() / 1000))
        .first<Learner>();
      if (!created) return jsonError("An account with this email already exists. Try signing in instead.", 409);
      await setLearnerSession(created);
      return NextResponse.json({ ok: true, returnTo });
    }

    const account = await db.prepare(
      "SELECT id, email, name, password_hash FROM learner_accounts WHERE email = ?",
    ).bind(email).first<Learner & { password_hash: string | null }>();
    if (!account?.password_hash || !await verifyPassword(password, account.password_hash)) {
      return jsonError("Email or password is incorrect.", 401);
    }
    await setLearnerSession({ id: account.id, email: account.email, name: account.name });
    return NextResponse.json({ ok: true, returnTo });
  } catch (error) {
    console.error("[email-auth] sign-in failed", error);
    return jsonError("Could not complete sign in. Please try again.", 500);
  }
}