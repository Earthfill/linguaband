"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function EmailAuthForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setVerificationEmail("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          email: form.get("email"),
          password: form.get("password"),
          returnTo,
        }),
      });
      const result = await response.json() as {
        error?: string;
        returnTo?: string;
        verificationRequired?: boolean;
        email?: string;
        message?: string;
      };
      if (!response.ok) {
        setError(result.error ?? "Could not sign in. Please try again.");
        if (result.verificationRequired && typeof result.email === "string") {
          setVerificationEmail(result.email);
        }
        return;
      }
      if (result.verificationRequired) {
        setNotice("Your account is created. Check your inbox for a verification link. It expires in one hour.");
        setMode("login");
        return;
      }
      if (result.message) {
        setNotice(result.message);
        return;
      }
      router.replace(result.returnTo ?? "/writing");
      router.refresh();
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="mt-7 grid grid-cols-2 rounded-full bg-zinc-100 p-1" aria-label="Account action">
        {(["login", "register"] as const).map((option) => (
          <button key={option} type="button" onClick={() => { setMode(option); setError(""); }}
            aria-pressed={mode === option}
            className={`min-h-10 rounded-full px-3 text-sm font-semibold capitalize transition-colors ${mode === option ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}>
            {option === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      {notice ? <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p> : null}
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={254}
            className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-700">Password</label>
          <input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"}
            required minLength={mode === "register" ? 12 : 1} maxLength={128}
            aria-describedby={mode === "register" ? "password-help" : undefined}
            className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          {mode === "register" ? <p id="password-help" className="mt-1 text-xs text-zinc-500">Use at least 12 characters.</p> : null}
        </div>
        {error ? <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</p> : null}
        {verificationEmail ? (
          <button type="button" disabled={pending}
            onClick={async () => {
              setPending(true);
              setError("");
              setNotice("");
              try {
                const response = await fetch("/api/auth/email", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ mode: "resend-verification", action: "resend-verification", email: verificationEmail }),
                });
                const result = await response.json() as { message?: string; error?: string };
                if (!response.ok) setError(result.error ?? "Could not resend the verification email.");
                else setNotice(result.message ?? "If the account needs verification, an email will be sent shortly.");
              } catch {
                setError("Could not connect. Please try again.");
              } finally {
                setPending(false);
              }
            }}
            className="w-full text-sm font-semibold text-blue-700 underline underline-offset-2 disabled:opacity-60">
            Resend verification email
          </button>
        ) : null}
        <button type="submit" disabled={pending}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
          {pending ? "Please wait…" : mode === "login" ? "Sign in with email" : "Create account"}
        </button>
      </form>
    </>
  );
}