"use client";

import { useMemo, useState } from "react";
import { questionBank } from "@/data/practice";
import { Icon } from "@/components/icons";
import { McqPractice } from "@/components/practice/McqPractice";

type Skill = "All" | "Listening" | "Reading";

export function QuestionBank() {
  const [skill, setSkill] = useState<Skill>("All");
  const [query, setQuery] = useState("");
  const [practicing, setPracticing] = useState(false);

  const filtered = useMemo(() => {
    return questionBank.filter((q) => {
      if (skill !== "All" && q.skill !== skill) return false;
      if (query.trim()) {
        const needle = query.trim().toLowerCase();
        const haystack = `${q.question} ${q.source} ${q.part}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [skill, query]);

  const counts = useMemo(
    () => ({
      All: questionBank.length,
      Listening: questionBank.filter((q) => q.skill === "Listening").length,
      Reading: questionBank.filter((q) => q.skill === "Reading").length,
    }),
    [],
  );

  if (practicing) {
    return (
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPracticing(false)}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400"
          >
            <Icon name="arrow-right" size={14} className="rotate-180" />
            Back to bank
          </button>
          <p className="text-sm text-zinc-500">
            Practicing {filtered.length} question{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
        <McqPractice questions={filtered} accent="blue" />
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["All", "Listening", "Reading"] as Skill[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSkill(s)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                skill === s
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
              }`}
            >
              {s}
              <span className={`ml-1.5 text-xs ${skill === s ? "text-zinc-300" : "text-zinc-400"}`}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>
        <label className="relative block w-full sm:w-72">
          <Icon
            name="quiz"
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            className="h-10 w-full rounded-full border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-blue-400"
          />
        </label>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <Icon name="quiz" size={28} className="mx-auto text-zinc-300" />
          <p className="mt-3 font-semibold text-zinc-700">No questions match</p>
          <p className="mt-1 text-sm text-zinc-500">Try a different skill or search term.</p>
          <button
            type="button"
            onClick={() => {
              setSkill("All");
              setQuery("");
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400"
          >
            <Icon name="refresh" size={14} />
            Clear filters
          </button>
        </div>
      ) : null}
      {/* Question list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((q) => (
            <article
              key={q.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-200"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                      q.skill === "Listening"
                        ? "bg-violet-50 text-violet-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {q.skill}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-400">
                    {q.part} · {q.source}
                  </span>
                </div>
                <p className="mt-2 text-[15px] font-medium leading-6 text-zinc-800">
                  {q.question}
                </p>
              </div>
              <span className="mt-1 hidden shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-500 sm:block">
                {q.options.length} options
              </span>
            </article>
          ))}
        </div>
      ) : null}

      {/* Practice CTA */}
      {filtered.length > 0 ? (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
          <div>
            <p className="font-display text-base font-bold text-zinc-900">
              Practice these {filtered.length} question{filtered.length === 1 ? "" : "s"}
            </p>
            <p className="mt-0.5 text-sm text-zinc-500">
              Get instant checking and a full explanation on every answer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPracticing(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Icon name="play" size={14} />
            Start practice
          </button>
        </div>
      ) : null}
    </div>
  );
}

