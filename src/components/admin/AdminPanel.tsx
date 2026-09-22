"use client";

import { useState } from "react";
import type { AdminMock } from "@/lib/store";

export function AdminPanel({ mocks }: { mocks: AdminMock[] }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        warnings?: string[];
        errors?: { message: string }[];
      } | null;
      if (res.ok) {
        const extras = data?.warnings?.length ? ` ${data.warnings.join(" ")}` : "";
        setResult({ ok: true, message: `Uploaded. Audio will be generated shortly.${extras}` });
      } else {
        const errors = data?.errors?.map((x) => x.message).join("; ") ?? "Upload failed";
        setResult({ ok: false, message: errors });
      }
    } catch {
      setResult({ ok: false, message: "Upload failed (network error)" });
    } finally {
      setBusy(false);
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
                <StatusBadge status={m.status} />
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
