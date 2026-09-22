import { cookies } from "next/headers";

const COOKIE = "shilu_admin";

async function secret(): Promise<string> {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

async function sign(value: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isAdmin(): Promise<boolean> {
  const key = await secret();
  if (!key) return false;
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return false;
  return token === (await sign("admin", key));
}

export async function login(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  const key = await secret();
  if (!expected || !key || password !== expected) return false;
  const token = await sign("admin", key);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, "", { path: "/", maxAge: 0 });
}
