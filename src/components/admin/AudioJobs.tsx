"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminMock, AdminPracticeTrack } from "@/lib/store";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Icon, type IconName } from "@/components/icons";
import { isStuck, mockNeedsAttention, practiceTrackStatus, trackNeedsAttention } from "@/lib/admin-status";

const CLOCK_TICK_MS = 30_000;
const AUTO_REFRESH_MS = 20_000;
const PAGE_SIZE = 20;

type Filter = "all" | "attention" | "ready";
type JobResult = { ok: boolean; message: string };

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "attention", label: "Needs attention" },
  { key: "ready", label: "Ready" },
];

function relativeTime(iso: string | undefined, now: number): string | null {
  if (!iso || now === 0) return null;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;
  const diff = Math.max(0, now - then);
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function ResultAlert({ result }: { result: JobResult | null }) {
  if (!result) return null;
  return (
    <p
      role="status"
      className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm leading-5 ${
        result.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"
      }`}
    >
      <Icon name={result.ok ? "check" : "x"} size={16} className="mt-0.5 shrink-0" />
      <span>{result.message}</span>
    </p>
  );
}

function SummaryChips({ items }: { items: { label: string; count: number; className: string }[] }) {
  const visible = items.filter((item) => item.count > 0);
  if (visible.length === 0) {
    return <span className="text-xs font-medium text-zinc-400">No jobs yet</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((item) => (
        <span key={item.label} className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${item.className}`}>
          {item.count} {item.label}
        </span>
      ))}
    </div>
  );
}

function JobRow({
  tone,
  icon,
  title,
  id,
  updatedAt,
  now,
  badge,
  action,
}: {
  tone: string;
  icon: IconName;
  title: string;
  id: string;
  updatedAt?: string;
  now: number;
  badge: React.ReactNode;
  action?: React.ReactNode;
}) {
  const rel = relativeTime(updatedAt, now);
  return (
    <li className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-zinc-50">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tone}`}>
        <Icon name={icon} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-800">{title}</p>
        <p className="truncate text-xs text-zinc-400">
          {id}
          {rel ? ` · updated ${rel}` : ""}
        </p>
      </div>
      {action}
      {badge}
    </li>
  );
}

function EmptyState({ icon, title, body, cta }: { icon: IconName; title: string; body: string; cta?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-zinc-100 text-zinc-400">
        <Icon name={icon} size={20} />
      </span>
      <p className="mt-3 text-sm font-semibold text-zinc-700">{title}</p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-zinc-400">{body}</p>
      {cta ? (
        <Link href={cta.href} className="mt-4 rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-zinc-700">
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

function Pagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);
  if (total <= PAGE_SIZE) {
    return <p className="px-5 py-3 text-xs text-zinc-400">Showing all {total} {total === 1 ? "job" : "jobs"}</p>;
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 px-5 py-3">
      <p className="text-xs text-zinc-400">
        Showing <span className="font-semibold text-zinc-600">{start}–{end}</span> of{" "}
        <span className="font-semibold text-zinc-600">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="grid h-8 w-8 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900 disabled:opacity-40 disabled:hover:border-zinc-200 disabled:hover:text-zinc-500"
        >
          <Icon name="chevron-left" size={16} />
        </button>
        {pageNumbers(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-xs text-zinc-400">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={`grid h-8 min-w-8 place-items-center rounded-full px-2 text-xs font-bold transition ${
                p === page
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="grid h-8 w-8 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900 disabled:opacity-40 disabled:hover:border-zinc-200 disabled:hover:text-zinc-500"
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </div>
  );
}

export function AudioJobs({ mocks, listeningTracks }: { mocks: AdminMock[]; listeningTracks: AdminPracticeTrack[] }) {
  const router = useRouter();
  const [retrying, setRetrying] = useState<string | null>(null);
  const [retryingPractice, setRetryingPractice] = useState<string | null>(null);
  const [result, setResult] = useState<JobResult | null>(null);
  const [practiceResult, setPracticeResult] = useState<JobResult | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [trackPage, setTrackPage] = useState(1);
  const [mockPage, setMockPage] = useState(1);
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

  const hasGenerating =
    mocks.some((mock) => mock.status === "generating") ||
    listeningTracks.some((track) => practiceTrackStatus(track) === "generating");

  useEffect(() => {
    if (!hasGenerating) return;
    const id = window.setInterval(() => router.refresh(), AUTO_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [hasGenerating, router]);

  function manualRefresh() {
    setRefreshing(true);
    router.refresh();
    window.setTimeout(() => setRefreshing(false), 700);
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

  const q = query.trim().toLowerCase();
  const matches = (id: string, title: string) => q === "" || id.toLowerCase().includes(q) || title.toLowerCase().includes(q);
  const searchedTracks = listeningTracks.filter((track) => matches(track.id, track.title));
  const searchedMocks = mocks.filter((mock) => matches(mock.id, mock.name));

  const keep = (needsAttention: boolean, ready: boolean) =>
    filter === "all" || (filter === "attention" ? needsAttention : ready);

  const visibleTracks = searchedTracks
    .filter((track) => keep(trackNeedsAttention(track, now), practiceTrackStatus(track) === "ready"))
    .sort((a, b) => Number(trackNeedsAttention(b, now)) - Number(trackNeedsAttention(a, now)));
  const visibleMocks = searchedMocks
    .filter((mock) => keep(mockNeedsAttention(mock, now), mock.status === "ready"))
    .sort((a, b) => Number(mockNeedsAttention(b, now)) - Number(mockNeedsAttention(a, now)));

  const trackTotalPages = Math.max(1, Math.ceil(visibleTracks.length / PAGE_SIZE));
  const mockTotalPages = Math.max(1, Math.ceil(visibleMocks.length / PAGE_SIZE));
  const safeTrackPage = Math.min(trackPage, trackTotalPages);
  const safeMockPage = Math.min(mockPage, mockTotalPages);
  const pagedTracks = visibleTracks.slice((safeTrackPage - 1) * PAGE_SIZE, safeTrackPage * PAGE_SIZE);
  const pagedMocks = visibleMocks.slice((safeMockPage - 1) * PAGE_SIZE, safeMockPage * PAGE_SIZE);

  const counts: Record<Filter, number> = {
    all: searchedTracks.length + searchedMocks.length,
    attention:
      searchedTracks.filter((track) => trackNeedsAttention(track, now)).length +
      searchedMocks.filter((mock) => mockNeedsAttention(mock, now)).length,
    ready:
      searchedTracks.filter((track) => practiceTrackStatus(track) === "ready").length +
      searchedMocks.filter((mock) => mock.status === "ready").length,
  };

  const trackSummary = {
    ready: listeningTracks.filter((track) => practiceTrackStatus(track) === "ready").length,
    generating: listeningTracks.filter((track) => practiceTrackStatus(track) === "generating").length,
    failed: listeningTracks.filter((track) => practiceTrackStatus(track) === "failed").length,
  };
  const mockSummary = {
    ready: mocks.filter((mock) => mock.status === "ready").length,
    generating: mocks.filter((mock) => mock.status === "generating").length,
    failed: mocks.filter((mock) => mock.status === "failed").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter audio jobs">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setFilter(item.key);
                setTrackPage(1);
                setMockPage(1);
              }}
              aria-pressed={filter === item.key}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                filter === item.key
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              {item.label}
              <span className={`ml-1.5 ${filter === item.key ? "text-zinc-400" : "text-zinc-400"}`}>{counts[item.key]}</span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setTrackPage(1);
              setMockPage(1);
            }}
            placeholder="Search id or title…"
            aria-label="Search audio jobs"
            className="w-44 rounded-full border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-700 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 sm:w-56"
          />
        </div>
        <button
          type="button"
          onClick={manualRefresh}
          title="Refresh now"
          aria-label="Refresh"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900"
        >
          <Icon name="refresh" size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {hasGenerating ? (
        <p className="text-xs text-zinc-400">
          Auto-refreshing every {AUTO_REFRESH_MS / 1000}s while jobs are generating…
        </p>
      ) : null}

      <ResultAlert result={result} />
      <ResultAlert result={practiceResult} />

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-violet-600">Practice content</p>
              <h2 className="mt-0.5 font-display text-lg font-bold text-zinc-900">Listening practice audio</h2>
            </div>
            <SummaryChips
              items={[
                { label: "ready", count: trackSummary.ready, className: "bg-emerald-50 text-emerald-700" },
                { label: "generating", count: trackSummary.generating, className: "bg-amber-50 text-amber-700" },
                { label: "failed", count: trackSummary.failed, className: "bg-rose-50 text-rose-700" },
              ]}
            />
          </div>
          {listeningTracks.length === 0 ? (
            <EmptyState
              icon="headphones"
              title="No listening tracks yet"
              body="Upload listening practice sets and their audio jobs will appear here."
              cta={{ href: "/admin/uploads", label: "Upload practice sets" }}
            />
          ) : visibleTracks.length === 0 ? (
            <EmptyState
              icon="search"
              title="No matching tracks"
              body="Nothing here matches the current filter or search."
            />
          ) : (
            <>
              <ul className="divide-y divide-zinc-100">
                {pagedTracks.map((track) => {
                  const status = practiceTrackStatus(track);
                  const stuck = isStuck(status, track.updatedAt, now);
                  return (
                    <JobRow
                      key={track.id}
                      tone="bg-violet-50 text-violet-600"
                      icon="headphones"
                      title={track.title}
                      id={track.id}
                      updatedAt={track.updatedAt}
                      now={now}
                      badge={<StatusBadge status={stuck ? "stuck" : status} />}
                      action={
                        status !== "ready" || stuck ? (
                          <button
                            type="button"
                            onClick={() => retryPracticeAudio(track.id)}
                            disabled={retryingPractice === track.id}
                            className="shrink-0 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:border-violet-300 hover:text-violet-600 disabled:opacity-50"
                          >
                            {retryingPractice === track.id ? "…" : status === "generating" || stuck ? "Re-queue audio" : "Generate audio"}
                          </button>
                        ) : null
                      }
                    />
                  );
                })}
              </ul>
              <Pagination page={safeTrackPage} totalPages={trackTotalPages} total={visibleTracks.length} onPage={setTrackPage} />
            </>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Mock library</p>
              <h2 className="mt-0.5 font-display text-lg font-bold text-zinc-900">Mock exam audio</h2>
            </div>
            <SummaryChips
              items={[
                { label: "ready", count: mockSummary.ready, className: "bg-emerald-50 text-emerald-700" },
                { label: "generating", count: mockSummary.generating, className: "bg-amber-50 text-amber-700" },
                { label: "failed", count: mockSummary.failed, className: "bg-rose-50 text-rose-700" },
              ]}
            />
          </div>
          {mocks.length === 0 ? (
            <EmptyState
              icon="layers"
              title="No mock exams yet"
              body="Upload a mock exam and its listening audio jobs will appear here."
              cta={{ href: "/admin/uploads", label: "Upload mock exam" }}
            />
          ) : visibleMocks.length === 0 ? (
            <EmptyState
              icon="search"
              title="No matching mocks"
              body="Nothing here matches the current filter or search."
            />
          ) : (
            <>
              <ul className="divide-y divide-zinc-100">
                {pagedMocks.map((mock) => {
                  const stuck = isStuck(mock.status, mock.updatedAt, now);
                  const needsAction = mock.status === "content" || mock.status === "failed" || stuck;
                  return (
                    <JobRow
                      key={mock.id}
                      tone="bg-blue-50 text-blue-600"
                      icon="layers"
                      title={mock.name}
                      id={mock.id}
                      updatedAt={mock.updatedAt}
                      now={now}
                      badge={<StatusBadge status={stuck ? "stuck" : mock.status} />}
                      action={
                        needsAction ? (
                          <button
                            type="button"
                            onClick={() => retryAudio(mock.id)}
                            disabled={retrying === mock.id}
                            title={
                              stuck
                                ? "This job looks stuck — queue the audio again"
                                : "Queue audio generation for this mock"
                            }
                            className="shrink-0 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
                          >
                            {retrying === mock.id ? "…" : stuck ? "Re-queue audio" : "Retry audio"}
                          </button>
                        ) : null
                      }
                    />
                  );
                })}
              </ul>
              <Pagination page={safeMockPage} totalPages={mockTotalPages} total={visibleMocks.length} onPage={setMockPage} />
            </>
          )}
        </div>
      </div>

      <p className="text-xs leading-5 text-zinc-400">
        A job still showing “generating” for more than 15 minutes is treated as stuck. Retries run the Generate
        Audio GitHub Actions job and take about two minutes.
      </p>
    </div>
  );
}
