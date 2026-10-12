"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type VocabularyResult = { ok: boolean; message: string };

export function VocabularyUpload() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VocabularyResult | null>(null);

  async function uploadVocabulary(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch("/api/admin/vocabulary", { method: "POST", body: new FormData(formElement) });
      const data = await response.json().catch(() => null) as { topics?: number; words?: number; errors?: string[]; error?: string } | null;
      if (!response.ok) {
        setResult({ ok: false, message: data?.errors?.join("; ") || data?.error || `Upload failed (${response.status})` });
        return;
      }
      setResult({ ok: true, message: `Published ${data?.words ?? 0} words across ${data?.topics ?? 0} topics.` });
      formElement.reset();
      router.refresh();
    } catch {
      setResult({ ok: false, message: "Upload failed (network error)." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={uploadVocabulary} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-700">Aa</span>
        <div>
          <h3 className="font-display text-lg font-bold text-zinc-900">Vocabulary builder</h3>
          <p className="mt-1 text-sm leading-5 text-zinc-500">Upload a JSON array of topics, each with words, definitions, examples, and collocations. The upload replaces the current vocabulary content.</p>
        </div>
      </div>
      <label className="block text-sm font-medium text-zinc-700">Vocabulary JSON<input type="file" name="file" accept="application/json,.json" required className="mt-2 block w-full rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white" /></label>
      <button type="submit" disabled={busy} className="mt-4 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50">{busy ? "Publishing…" : "Upload vocabulary"}</button>
      {result ? <p role="status" className={"mt-4 rounded-xl px-4 py-3 text-sm leading-6 " + (result.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700")}>{result.message}</p> : null}
    </form>
  );
}
