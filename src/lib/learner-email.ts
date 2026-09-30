import { learnerAuthEnv, type Learner } from "@/lib/learner-auth";

type EmailDatabase = NonNullable<ReturnType<typeof learnerAuthEnv>["DB"]>;

function base64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function emailDeliveryConfigured(): boolean {
  const env = learnerAuthEnv();
  return Boolean(env.RESEND_API_KEY && env.RESEND_FROM && env.APP_BASE_URL);
}

function appBaseUrl(): string {
  const value = learnerAuthEnv().APP_BASE_URL;
  if (!value) throw new Error("APP_BASE_URL is not configured.");
  const url = new URL(value);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("APP_BASE_URL must use HTTPS outside localhost.");
  }
  return url.origin;
}

async function sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
  const env = learnerAuthEnv();
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) throw new Error("Resend email delivery is not configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: env.RESEND_FROM, to: [to], subject, html, text }),
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("[learner-email] provider rejected email", response.status, detail.slice(0, 500));
    throw new Error(`Email delivery failed (${response.status}).`);
  }
}

export async function sendVerificationEmail(db: EmailDatabase, learner: Learner): Promise<void> {
  const token = base64Url(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 60 * 60;
  await db.prepare("DELETE FROM learner_email_verification_tokens WHERE account_id = ?").bind(learner.id).run();
  await db.prepare(
    "INSERT INTO learner_email_verification_tokens (token_hash, account_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
  ).bind(tokenHash, learner.id, expiresAt, now).run();

  const link = new URL("/api/auth/email/verify", appBaseUrl());
  link.searchParams.set("token", token);
  const safeLink = link.toString();
  await sendEmail(
    learner.email,
    "Verify your Linguaband email",
    `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#18181b;max-width:560px;margin:auto"><h1>Verify your email</h1><p>Thanks for creating a Linguaband account. Confirm your email address to finish setting up your account.</p><p><a href="${safeLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:24px;text-decoration:none;font-weight:bold">Verify email address</a></p><p>This link expires in one hour and can only be used once. If you did not create this account, you can ignore this message.</p></div>`,
    `Thanks for creating a Linguaband account. Verify your email using this link (expires in one hour): ${safeLink}\n\nIf you did not create this account, ignore this message.`,
  );
}

export async function sendWelcomeEmail(learner: Learner): Promise<void> {
  const base = appBaseUrl();
  await sendEmail(
    learner.email,
    "Welcome to Linguaband",
    `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#18181b;max-width:560px;margin:auto"><h1>Welcome to Linguaband!</h1><p>Hi ${escapeHtml(learner.name)},</p><p>Your account is ready. Practice CELPIP skills and get personalized AI writing feedback in your writing workspace.</p><p><a href="${base}/writing" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:24px;text-decoration:none;font-weight:bold">Start practicing</a></p><p>AI feedback is practice guidance, not an official CELPIP score.</p></div>`,
    `Welcome to Linguaband, ${learner.name}! Your account is ready. Start practicing: ${base}/writing\n\nAI feedback is practice guidance, not an official CELPIP score.`,
  );
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}

export async function verifyLearnerEmail(db: EmailDatabase, token: string): Promise<boolean> {
  if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return false;
  const tokenHash = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  const claimed = await db.prepare(
    "DELETE FROM learner_email_verification_tokens WHERE token_hash = ? AND expires_at > ? " +
    "RETURNING account_id",
  ).bind(tokenHash, now).first<{ account_id: string }>();
  if (!claimed) return false;
  const updated = await db.prepare(
    "UPDATE learner_accounts SET email_verified = 1 WHERE id = ? RETURNING id",
  ).bind(claimed.account_id).first<{ id: string }>();
  return Boolean(updated);
}