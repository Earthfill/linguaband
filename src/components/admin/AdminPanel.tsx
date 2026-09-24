"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminMock } from "@/lib/store";

export function AdminPanel({ mocks }: { mocks: AdminMock[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const text = await res.text();
      let data: {
        ok?: boolean;
        warnings?: string[];
        errors?: { message: string }[];
        dispatched?: boolean;
        status?: number;
        error?: string;
      } | null = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
      if (res.ok) {
        const warnings = data?.warnings?.length ? ` ${data.warnings.join(" ")}` : "";
        const note = data?.dispatched
          ? "Audio generation started."
          : `Audio was NOT scheduled — ${data?.status ?? ""} ${data?.error ?? "check GITHUB_TOKEN / GITHUB_REPO"}`.trim();
        setResult({ ok: true, message: `Uploaded. ${note}${warnings}` });
        router.refresh();
      } else {
        const errors = data?.errors?.map((x) => x.message).join("; ");
        setResult({ ok: false, message: errors || text.trim() || `Upload failed (${res.status})` });
      }
    } catch {
      setResult({ ok: false, message: "Upload failed (network error)" });
    } finally {
      setBusy(false);
    }
  }

  async function retryAudio(mockId: string) {
    setRetrying(mockId);
    try {
      const form = new FormData();
      form.append("mockId", mockId);
      const res = await fetch("/api/admin/regenerate-audio", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        dispatched?: boolean;
        status?: number;
        error?: string;
      } | null;
      if (res.ok) {
        setResult({
          ok: true,
          message: data?.dispatched
            ? "Audio generation started."
            : `Retry not dispatched — ${data?.status ?? ""} ${data?.error ?? "check GITHUB_TOKEN / GITHUB_REPO"}`.trim(),
        });
        router.refresh();
      } else {
        setResult({ ok: false, message: data?.error || `Retry failed (${res.status})` });
      }
    } catch {
      setResult({ ok: false, message: "Retry failed (network error)" });
    } finally {
      setRetrying(null);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h2 className="font-display text-lg font-bold text-zinc-900">Upload a mock test</h2>
        <p className="mt-1 text-sm text-zinc-500">
          One JSON file, shaped exactly like the template (see README).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="file"
            name="file"
            accept="application/json"
            required
            className="text-sm text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Uploading…" : "Upload"}
          </button>
        </div>
        {result ? (
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-sm ${
              result.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {result.message}
          </p>
        ) : null}
      </form>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-zinc-900">Mocks</h2>
        {mocks.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">None uploaded yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100">
            {mocks.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-sm text-zinc-700">
                  {m.name} <span className="text-zinc-400">({m.id})</span>
                </span>
                <div className="flex items-center gap-2">
                  {m.status === "content" || m.status === "failed" ? (
                    <button
                      type="button"
                      onClick={() => retryAudio(m.id)}
                      disabled={retrying === m.id}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600 transition-colors hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
                    >
                      {retrying === m.id ? "…" : "Retry audio"}
                    </button>
                  ) : null}
                  <StatusBadge status={m.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    content: "text-zinc-600 bg-zinc-100",
    generating: "text-amber-700 bg-amber-50",
    ready: "text-emerald-700 bg-emerald-50",
    failed: "text-rose-700 bg-rose-50",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        map[status] ?? "text-zinc-600 bg-zinc-100"
      }`}
    >
      {status}
    </span>
  );
}
