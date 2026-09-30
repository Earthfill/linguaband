import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const SESSION_COOKIE = "linguaband_learner";
const OAUTH_STATE_COOKIE = "linguaband_google_state";
const OAUTH_RETURN_COOKIE = "linguaband_google_return";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const PASSWORD_HASH_ITERATIONS = 100_000;

export type Learner = { id: string; email: string; name: string };

export type LearnerAuthEnv = {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URI?: string;
  LEARNER_SESSION_SECRET?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  APP_BASE_URL?: string;
  DB?: {
    prepare(sql: string): {
      bind(...values: (string | number | null)[]): {
        first<T>(): Promise<T | null>;
        run(): Promise<unknown>;
      };
    };
    batch?(statements: unknown[]): Promise<unknown[]>;
  };
};

export function learnerAuthEnv(): LearnerAuthEnv {
  try {
    return getCloudflareContext().env as LearnerAuthEnv;
  } catch {
    return {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
      LEARNER_SESSION_SECRET: process.env.LEARNER_SESSION_SECRET,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      RESEND_FROM: process.env.RESEND_FROM,
      APP_BASE_URL: process.env.APP_BASE_URL,
      DB: undefined,
    };
  }
}

export async function getOrCreateGoogleLearner(profile: Learner): Promise<{ learner: Learner; created: boolean }> {
  const db = learnerAuthEnv().DB;
  if (!db) throw new Error("Learner account storage is not configured.");
  const id = crypto.randomUUID();
  const createdAccount = await db.prepare(
    "INSERT INTO learner_accounts (id, email, name, password_hash, email_verified, created_at) VALUES (?, ?, ?, NULL, 1, ?) " +
    "ON CONFLICT(email) DO UPDATE SET name = excluded.name, email_verified = 1 " +
    "RETURNING id, created_at = excluded.created_at AS is_new_account",
  ).bind(id, profile.email, profile.name, Math.floor(Date.now() / 1000))
    .first<{ id: string; is_new_account: number }>();
  const account = await db.prepare("SELECT id, email, name FROM learner_accounts WHERE email = ?")
    .bind(profile.email).first<Learner>();
  if (!account) throw new Error("Could not load Google learner account.");
  return { learner: account, created: createdAccount?.is_new_account === 1 };
}

function base64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - (normalized.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signature(value: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function cookieOptions(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge };
}

export function googleAuthConfigured(env = learnerAuthEnv()): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.LEARNER_SESSION_SECRET);
}

export async function hashPassword(password: string, salt?: Uint8Array): Promise<string> {
  const actualSalt = salt ?? new Uint8Array(crypto.getRandomValues(new Uint8Array(16)));
  const saltBuffer = new ArrayBuffer(actualSalt.length);
  new Uint8Array(saltBuffer).set(actualSalt);
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBuffer, iterations: PASSWORD_HASH_ITERATIONS },
    keyMaterial,
    256,
  );
  return `pbkdf2-sha256$${PASSWORD_HASH_ITERATIONS}$${base64Url(actualSalt)}$${base64Url(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, iterationsRaw, saltRaw, expectedRaw] = storedHash.split("$");
  if (algorithm !== "pbkdf2-sha256" || iterationsRaw !== String(PASSWORD_HASH_ITERATIONS) || !saltRaw || !expectedRaw) return false;
  try {
    const actual = await hashPassword(password, decodeBase64Url(saltRaw));
    const actualBytes = decodeBase64Url(actual.split("$")[3]);
    const expectedBytes = decodeBase64Url(expectedRaw);
    if (actualBytes.length !== expectedBytes.length) return false;
    let mismatch = 0;
    for (let index = 0; index < actualBytes.length; index += 1) mismatch |= actualBytes[index] ^ expectedBytes[index];
    return mismatch === 0;
  } catch {
    return false;
  }
}

export async function setOAuthState(state: string): Promise<void> {
  (await cookies()).set(OAUTH_STATE_COOKIE, state, cookieOptions(10 * 60));
}

export function safeLoginReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/writing";
  try {
    const parsed = new URL(value, "https://linguaband.invalid");
    if (parsed.origin !== "https://linguaband.invalid" || !["/", "/writing"].includes(parsed.pathname)) return "/writing";
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return "/writing";
  }
}

export async function setOAuthReturnPath(path: string): Promise<void> {
  (await cookies()).set(OAUTH_RETURN_COOKIE, safeLoginReturnPath(path), cookieOptions(10 * 60));
}

export async function consumeOAuthReturnPath(): Promise<string> {
  const store = await cookies();
  const path = store.get(OAUTH_RETURN_COOKIE)?.value;
  store.set(OAUTH_RETURN_COOKIE, "", cookieOptions(0));
  return safeLoginReturnPath(path);
}

export async function consumeOAuthState(state: string): Promise<boolean> {
  const store = await cookies();
  const saved = store.get(OAUTH_STATE_COOKIE)?.value;
  store.set(OAUTH_STATE_COOKIE, "", cookieOptions(0));
  return Boolean(saved && saved === state);
}

export async function setLearnerSession(learner: Learner): Promise<void> {
  const secret = learnerAuthEnv().LEARNER_SESSION_SECRET;
  if (!secret) throw new Error("Learner session secret is not configured.");
  const payload = base64Url(new TextEncoder().encode(JSON.stringify({ ...learner, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE })));
  const token = `${payload}.${base64Url(await signature(payload, secret))}`;
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(SESSION_MAX_AGE));
}

export async function getLearner(): Promise<Learner | null> {
  const secret = learnerAuthEnv().LEARNER_SESSION_SECRET;
  if (!secret) return null;
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const [payload, suppliedSignature] = token.split(".");
    if (!payload || !suppliedSignature) return null;
    const supplied = decodeBase64Url(suppliedSignature);
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    if (!await crypto.subtle.verify("HMAC", key, supplied.buffer as ArrayBuffer, new TextEncoder().encode(payload))) return null;
    const parsed = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload))) as Partial<Learner> & { exp?: number };
    if (typeof parsed.id !== "string" || typeof parsed.email !== "string" || typeof parsed.name !== "string" || !parsed.exp || parsed.exp <= Date.now() / 1000) return null;
    return { id: parsed.id, email: parsed.email, name: parsed.name };
  } catch {
    return null;
  }
}

export async function clearLearnerSession(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", cookieOptions(0));
}