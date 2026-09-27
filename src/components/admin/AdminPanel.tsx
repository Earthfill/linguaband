"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminMock } from "@/lib/store";
import type { AdminPracticeTrack } from "@/lib/store";

/** A "generating" row older than this is treated as stuck (the job failed or never ran). */
const STUCK_AFTER_MS = 15 * 60 * 1000;
const CLOCK_TICK_MS = 30_000;

function isStuck(mock: AdminMock, now: number): boolean {
  if (mock.status !== "generating") return false;
  const updated = mock.updatedAt ? Date.parse(mock.updatedAt) : NaN;
  if (Number.isNaN(updated)) return true;
  return now - updated > STUCK_AFTER_MS;
}

export function AdminPanel({ mocks, listeningTracks }: { mocks: AdminMock[]; listeningTracks: AdminPracticeTrack[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [retryingPractice, setRetryingPractice] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [practiceBusy, setPracticeBusy] = useState(false);
  const [practiceResult, setPracticeResult] = useState<{ ok: boolean; message: string } | null>(null);
  // 0 until the clock has been read in a timer (reading Date.now() during render would
  // break React's purity rules). Both server and client start at 0, so hydration matches.
  const [now, setNow] = useState(0);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const kick = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, CLOCK_TICK_MS);
    return () => {
      window.clearTimeout(kick);
      window.clearInterval(id);
    };
  }, []);

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

  async function retryPracticeAudio(trackId: string) {
    setRetryingPractice(trackId);
    try {
      const form = new FormData();
      form.append("trackId", trackId);
      const res = await fetch("/api/admin/regenerate-practice-audio", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as { dispatched?: boolean; status?: number; error?: string } | null;
      setPracticeResult({
        ok: res.ok && Boolean(data?.dispatched),
        message: data?.dispatched
          ? `Audio generation queued for ${trackId}.`
          : `Could not queue ${trackId} audio — ${data?.status ?? res.status} ${data?.error ?? "unknown error"}`,
      });
      router.refresh();
    } catch {
      setPracticeResult({ ok: false, message: `Retry failed for ${trackId} (network error).` });
    } finally {
      setRetryingPractice(null);
    }
  }

  async function uploadPracticeSets(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    setPracticeBusy(true);
    setPracticeResult(null);
    try {
      const res = await fetch("/api/admin/practice-sets", {
        method: "POST",
        body: new FormData(formElement),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        listening?: number;
        reading?: number;
        replacedIds?: string[];
        audio?: { id: string; ok: boolean; status?: number; error?: string }[];
        errors?: string[];
        error?: string;
      } | null;
      if (!res.ok) {
        setPracticeResult({
          ok: false,
          message: data?.errors?.join("; ") || data?.error || `Upload failed (${res.status})`,
        });
        return;
      }
      const replaced = data?.replacedIds?.length ? ` Replaced matching IDs: ${data.replacedIds.join(", ")}.` : "";
      const failedAudio = data?.audio?.filter((item) => !item.ok) ?? [];
      const pendingAudio = data?.audio?.filter((item) => item.ok) ?? [];
      const audioMessage = (data?.audio?.length ?? 0) === 0
        ? ""
        : `${pendingAudio.length ? ` Audio generation queued for ${pendingAudio.map((item) => item.id).join(", ")}.` : ""}${failedAudio.length ? ` Audio could not be queued for ${failedAudio.map((item) => `${item.id} (${item.status ?? ""} ${item.error ?? ""})`).join(", ")}.` : ""}`;
      setPracticeResult({
        ok: true,
        message: `Uploaded ${data?.listening ?? 0} listening and ${data?.reading ?? 0} reading set(s).${replaced}${audioMessage}`,
      });
      formElement.reset();
      router.refresh();
    } catch {
      setPracticeResult({ ok: false, message: "Upload failed (network error)." });
    } finally {
      setPracticeBusy(false);
    }
  }

  const practiceReady = listeningTracks.filter((track) => (track.audioStatus ?? (track.audio ? "ready" : "content")) === "ready").length;
  const mocksReady = mocks.filter((mock) => mock.status === "ready").length;
  const attention = listeningTracks.filter((track) => { const status = track.audioStatus ?? (track.audio ? "ready" : "content"); const updated = track.updatedAt ? Date.parse(track.updatedAt) : NaN; return status === "content" || status === "failed" || (status === "generating" && now > 0 && (Number.isNaN(updated) || now - updated > STUCK_AFTER_MS)); }).length + mocks.filter((mock) => mock.status === "content" || mock.status === "failed" || isStuck(mock, now)).length;
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-violet-950 px-6 py-8 text-white shadow-xl shadow-violet-950/10 sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-14 -top-28 h-72 w-72 rounded-full border border-white/10" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-violet-100"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Content studio</span><h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Admin dashboard</h1><p className="mt-2 max-w-xl text-sm leading-6 text-zinc-300">Manage practice content and keep audio generation on track from one place.</p></div>
          <a href="#uploads" className="inline-flex w-fit rounded-full bg-white px-5 py-3 text-sm font-bold text-zinc-900 transition hover:bg-violet-50">Upload content <span className="ml-2" aria-hidden="true">↓</span></a>
        </div>
      </section>
      <section aria-label="Content and audio overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Mock exams" value={mocks.length} detail="Uploaded tests" tone="blue" />
        <MetricCard label="Listening tracks" value={listeningTracks.length} detail="Practice audio jobs" tone="violet" />
        <MetricCard label="Audio ready" value={practiceReady + mocksReady} detail="Available for playback" tone="green" />
        <MetricCard label="Needs attention" value={attention} detail="Audio jobs to review" tone="amber" />
      </section>
      <section id="uploads" className="scroll-mt-24">
        <SectionTitle eyebrow="Content management" title="Upload new content" description="Add mock exams and publish listening or reading practice sets." />
        <div className="mt-4 grid gap-5 xl:grid-cols-2">
        <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700">▤</span><div><h3 className="font-display text-lg font-bold text-zinc-900">Mock exam</h3><p className="mt-1 text-sm leading-5 text-zinc-500">Upload one JSON file shaped like the mock template.</p></div></div>
          <label className="block text-sm font-medium text-zinc-700">Mock exam JSON<input type="file" name="file" accept="application/json,.json" required className="mt-2 block w-full rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white" /></label>
          <button type="submit" disabled={busy} className="mt-4 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-700 disabled:opacity-50">{busy ? "Uploading…" : "Upload mock exam"}</button>
          {result ? <p role="status" className={"mt-4 rounded-xl px-4 py-3 text-sm leading-6 " + (result.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700")}>{result.message}</p> : null}
        </form>

        <form onSubmit={uploadPracticeSets} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-lg font-bold text-violet-700">♫</span><div><h3 className="font-display text-lg font-bold text-zinc-900">Practice sets</h3><p className="mt-1 text-sm leading-5 text-zinc-500">Upload listening and reading JSON with any referenced track images.</p></div></div>
          <div className="grid gap-4"><label className="block text-sm font-medium text-zinc-700">Practice-set JSON<input type="file" name="file" accept="application/json,.json" required className="mt-2 block w-full rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white" /></label><label className="block text-sm font-medium text-zinc-700">Track images <span className="font-normal text-zinc-400">(optional)</span><input type="file" name="images" accept="image/png,image/jpeg,image/webp" multiple className="mt-2 block w-full rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-violet-100 file:px-4 file:py-2 file:text-xs file:font-bold file:text-violet-700" /></label></div>
          <button type="submit" disabled={practiceBusy} className="mt-4 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50">{practiceBusy ? "Uploading…" : "Upload practice sets"}</button>
          {practiceResult ? <p role="status" className={"mt-4 rounded-xl px-4 py-3 text-sm leading-6 " + (practiceResult.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700")}>{practiceResult.message}</p> : null}
        </form>
      </div>
      </section>

      <section id="audio-jobs" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <SectionTitle eyebrow="Generation queue" title="Audio jobs" description="Monitor generated audio and retry tracks that need attention." />
        <span className={"rounded-full px-3 py-1.5 text-xs font-bold " + (attention ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800")}>{attention ? String(attention) + " need attention" : "Everything looks good"}</span>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-6 pt-5 pb-2"><p className="text-xs font-bold uppercase tracking-wider text-violet-600">Practice content</p><h2 className="mt-1 font-display text-lg font-bold text-zinc-900">Listening practice audio</h2></div>
        {listeningTracks.length === 0 ? (
          <p className="px-6 py-5 text-sm text-zinc-500">No listening practice tracks uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {listeningTracks.map((track) => {
              const status = track.audioStatus ?? (track.audio ? "ready" : "content");
              const updated = track.updatedAt ? Date.parse(track.updatedAt) : NaN;
              const stuck = status === "generating" && now > 0 && (Number.isNaN(updated) || now - updated > STUCK_AFTER_MS);
              return (
                <li key={track.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-sm text-zinc-700">{track.title} <span className="text-zinc-400">({track.id})</span></span>
                  <div className="flex items-center gap-2">
                    {status !== "ready" || stuck ? (
                      <button type="button" onClick={() => retryPracticeAudio(track.id)} disabled={retryingPractice === track.id}
                        className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600 hover:border-violet-300 hover:text-violet-600 disabled:opacity-50">
                        {retryingPractice === track.id ? "…" : status === "generating" || stuck ? "Re-queue audio" : "Generate audio"}
                      </button>
                    ) : null}
                    <StatusBadge status={status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-6 pt-5 pb-2"><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Mock library</p><h2 className="mt-1 font-display text-lg font-bold text-zinc-900">Mock exam audio</h2></div>
        {mocks.length === 0 ? (
          <p className="px-6 py-5 text-sm text-zinc-500">No mock exams uploaded yet. Upload a mock exam above and its audio status will appear here.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {mocks.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-2">
                <span className="min-w-0 text-sm font-semibold text-zinc-700">
                  {m.name} <span className="font-normal text-zinc-400">({m.id})</span>
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  {m.status === "content" || m.status === "failed" || isStuck(m, now) ? (
                    <button
                      type="button"
                      onClick={() => retryAudio(m.id)}
                      disabled={retrying === m.id}
                      title={
                        isStuck(m, now)
                          ? "This job looks stuck — queue the audio again"
                          : "Queue audio generation for this mock"
                      }
                      className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
                    >
                      {retrying === m.id ? "…" : isStuck(m, now) ? "Re-queue audio" : "Retry audio"}
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
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail, tone }: { label: string; value: number; detail: string; tone: "blue" | "violet" | "green" | "amber" }) {
  const tones = { blue: "bg-blue-50 text-blue-700", violet: "bg-violet-50 text-violet-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700" };
  return <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-zinc-500">{label}</p><span className={"rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide " + tones[tone]}>Live</span></div><p className="mt-3 font-display text-3xl font-bold tracking-tight text-zinc-900">{value}</p><p className="mt-1 text-xs text-zinc-500">{detail}</p></div>;
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">{eyebrow}</p><h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-zinc-900">{title}</h2><p className="mt-1 text-sm text-zinc-500">{description}</p></div>;
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
