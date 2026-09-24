"use client";

import Link from "next/link";
import type { MockExam, MockSkill } from "@/data/practice";
import { Icon } from "@/components/icons";
import { useEffect, useMemo, useState } from "react";

const SKILL_SHORT: Record<MockSkill, string> = {
  listening: "L",
  reading: "R",
  writing: "W",
  speaking: "S",
};

type TypeKey = "full" | "half" | "rapid" | "soon";
type TypeFilter = "all" | TypeKey;
type ViewMode = "cards" | "list";

const GROUPS: { key: TypeKey; label: string; hint: string }[] = [
  { key: "full", label: "Full exams", hint: "All four skills, full length" },
  { key: "half", label: "Half exams", hint: "Two-skill combos" },
  { key: "rapid", label: "Rapid review", hint: "Short daily drills" },
  { key: "soon", label: "Coming soon", hint: "Not uploaded yet" },
];

function kindOf(exam: MockExam): TypeKey {
  const n = exam.sections.length;
  if (n === 0) return "soon";
  if (n >= 20) return "full";
  if (n >= 10) return "half";
  return "rapid";
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function useLocalStorage<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);
  return [value, setValue];
}

function ExamCard({ exam }: { exam: MockExam }) {
  const playable = exam.sections.length > 0;
  const totalSeconds = exam.sections.reduce((sum, s) => sum + s.timeLimitSec, 0);
  const mcqCount = exam.sections.reduce((sum, s) => sum + s.questions.length, 0);
  const skills = [...new Set(exam.sections.map((s) => SKILL_SHORT[s.skill]))].join(" · ");

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 ${
        playable ? "hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg" : "opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-display text-base font-bold leading-snug text-zinc-900">{exam.name}</h4>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            exam.difficulty === "Challenging" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
          }`}
        >
          {exam.badge}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">{exam.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {[
          { icon: "clock" as const, text: playable ? formatDuration(totalSeconds) : "—" },
          { icon: "quiz" as const, text: playable ? `${mcqCount} MCQ` : "—" },
          { icon: "layers" as const, text: playable ? skills : "—" },
        ].map((chip) => (
          <span
            key={chip.icon}
            className="inline-flex items-center gap-1 rounded-lg bg-zinc-50 px-2 py-1 text-[11px] font-semibold text-zinc-600"
          >
            <Icon name={chip.icon} size={12} className="text-blue-600" />
            {chip.text}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-4">
        {playable ? (
          <Link
            href={`/exams/${exam.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            <Icon name="play" size={13} />
            Start
          </Link>
        ) : (
          <span className="inline-flex w-full items-center justify-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-400">
            Coming soon
          </span>
        )}
      </div>
    </article>
  );
}

function ExamRow({ exam }: { exam: MockExam }) {
  const playable = exam.sections.length > 0;
  const totalSeconds = exam.sections.reduce((sum, s) => sum + s.timeLimitSec, 0);
  const mcqCount = exam.sections.reduce((sum, s) => sum + s.questions.length, 0);
  const skills = [...new Set(exam.sections.map((s) => SKILL_SHORT[s.skill]))].join("·");

  return (
    <div className={`flex items-center gap-4 px-4 py-3 sm:px-5 ${playable ? "" : "opacity-60"}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-bold text-zinc-900">{exam.name}</span>
          <span
            className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:inline ${
              exam.difficulty === "Challenging" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
            }`}
          >
            {exam.badge}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {playable ? `${skills} · ${formatDuration(totalSeconds)} · ${mcqCount} questions` : "Content coming soon"}
        </p>
      </div>
      {playable ? (
        <Link
          href={`/exams/${exam.id}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          <Icon name="play" size={12} />
          Start
        </Link>
      ) : (
        <span className="shrink-0 rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-semibold text-zinc-400">
          Soon
        </span>
      )}
    </div>
  );
}


export function ExamBrowser({ mocks }: { mocks: MockExam[] }) {
  const sorted = useMemo(
    () => [...mocks].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })),
    [mocks],
  );
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [view, setView] = useLocalStorage<ViewMode>("linguaband.exams.view", "cards");
  const [collapsed, setCollapsed] = useLocalStorage<string[]>("linguaband.exams.collapsed", []);

  const counts = useMemo(() => {
    const c: Record<TypeFilter, number> = { all: sorted.length, full: 0, half: 0, rapid: 0, soon: 0 };
    for (const m of sorted) c[kindOf(m)] += 1;
    return c;
  }, [sorted]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((m) => {
      if (type !== "all" && kindOf(m) !== type) return false;
      if (q) {
        const hay = `${m.name} ${m.description} ${m.badge}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sorted, query, type]);

  const grouped = useMemo(
    () =>
      GROUPS.map((g) => ({ ...g, items: filtered.filter((m) => kindOf(m) === g.key) })).filter(
        (g) => g.items.length > 0,
      ),
    [filtered],
  );

  const toggleCollapse = (key: TypeKey) =>
    setCollapsed(collapsed.includes(key) ? collapsed.filter((k) => k !== key) : [...collapsed, key]);

  const clearFilters = () => {
    setQuery("");
    setType("all");
  };

  const chips: { key: TypeFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "full", label: "Full exams" },
    { key: "half", label: "Half exams" },
    { key: "rapid", label: "Rapid" },
    { key: "soon", label: "Coming soon" },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-16 z-30 mb-6 rounded-2xl border border-zinc-200 bg-white/90 p-3 shadow-sm shadow-zinc-900/5 backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-xs">
            <Icon
              name="search"
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mock exams…"
              className="h-10 w-full rounded-full border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-blue-400"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setType(c.key)}
                aria-pressed={type === c.key}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                  type === c.key
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}
              >
                {c.label}
                <span className={`ml-1.5 text-xs ${type === c.key ? "text-zinc-300" : "text-zinc-400"}`}>
                  {counts[c.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1">
            {(["cards", "list"] as ViewMode[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                title={v === "cards" ? "Card view" : "List view"}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === v ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Icon name={v === "cards" ? "grid" : "list"} size={14} />
                {v === "cards" ? "Cards" : "List"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-zinc-500">
        Showing {filtered.length} of {sorted.length} {sorted.length === 1 ? "mock" : "mocks"}
      </p>

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <Icon name="quiz" size={28} className="mx-auto text-zinc-300" />
          <p className="mt-3 font-semibold text-zinc-700">No mocks match</p>
          <p className="mt-1 text-sm text-zinc-500">Try a different search term or filter.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400"
          >
            <Icon name="refresh" size={14} />
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => {
            const isCollapsed = collapsed.includes(group.key);
            return (
              <section key={group.key}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 font-display text-lg font-bold text-zinc-900">
                    {group.label}
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-500">
                      {group.items.length}
                    </span>
                    <span className="hidden text-xs font-normal text-zinc-400 sm:inline">{group.hint}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => toggleCollapse(group.key)}
                    aria-expanded={!isCollapsed}
                    aria-label={`${group.label}: ${isCollapsed ? "expand" : "collapse"}`}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900"
                  >
                    <Icon
                      name="chevron-down"
                      size={16}
                      className={`transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                    />
                  </button>
                </div>

                {!isCollapsed ? (
                  view === "cards" ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {group.items.map((exam) => (
                        <ExamCard key={exam.id} exam={exam} />
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                      {group.items.map((exam) => (
                        <ExamRow key={exam.id} exam={exam} />
                      ))}
                    </div>
                  )
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
