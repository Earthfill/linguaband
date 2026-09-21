"use client";

import { useMemo, useState } from "react";
import type { WritingTask } from "@/data/practice";
import { Icon } from "@/components/icons";

const discourseMarkers = [
  "first", "second", "third", "finally", "however", "therefore", "additionally",
  "for example", "in addition", "as a result", "moreover", "furthermore",
];

type FeedbackBars = { label: string; pct: number; note: string };

export function WritingWorkspace({ task }: { task: WritingTask }) {
  const [text, setText] = useState("");
  const [showSample, setShowSample] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackBars[] | null>(null);

  const wordCount = useMemo(
    () => (text.trim() ? text.trim().split(/\s+/).length : 0),
    [text],
  );
  const sentences = useMemo(
    () => (text.match(/[.!?]+/g) ?? []).length,
    [text],
  );
  const paragraphs = useMemo(
    () => (text.trim() ? text.split(/\n\s*\n/).length : 0),
    [text],
  );

  const [targetMin, targetMax] = useMemo(() => {
    const words = task.wordTarget.match(/\d+/g)?.map(Number) ?? [150, 150];
    return [words[0] ?? 150, words[1] ?? words[0] ?? 200];
  }, [task.wordTarget]);

  function analyze() {
    const markers = discourseMarkers.filter((m) =>
      text.toLowerCase().includes(m),
    ).length;
    const lengthPct = Math.min(100, Math.round((wordCount / targetMax) * 100));
    const cohesion = Math.min(
      Math.round((markers / 3) * 100) + (paragraphs >= 2 ? 20 : 0),
      100,
    );
    const structurePct = Math.round(
      ((sentences >= 8 ? 1 : sentences / 8) + (paragraphs >= 2 ? 1 : 0)) * 50,
    );

    setFeedback([
      {
        label: "Length",
        pct: lengthPct,
        note:
          wordCount === 0
            ? "Start writing to see feedback."
            : wordCount < targetMin
              ? `Aim for ${task.wordTarget} — you're at ${wordCount}.`
              : "Within the target range.",
      },
      {
        label: "Cohesion",
        pct: cohesion,
        note:
          markers < 2
            ? "Add linking phrases like 'however' or 'for example'."
            : "Good use of linking phrases.",
      },
      {
        label: "Structure",
        pct: structurePct,
        note:
          paragraphs < 2
            ? "Split your answer into clear paragraphs."
            : "Paragraphs are in place.",
      },
    ]);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Task brief + workspace */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            {task.task}
          </p>
          <h3 className="mt-1 font-display text-xl font-bold text-zinc-900">
            {task.title}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-zinc-500">
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1">
              <Icon name="clock" size={13} /> {task.timeLimit}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1">
              <Icon name="target" size={13} /> {task.wordTarget}
            </span>
          </div>
          <div className="mt-4 rounded-xl bg-zinc-50 p-4">
            <p className="whitespace-pre-line text-sm leading-7 text-zinc-700">
              {task.scenario}
            </p>
          </div>
          <ul className="mt-4 space-y-1.5 text-sm text-zinc-500">
            {task.instructions.map((instruction) => (
              <li key={instruction} className="flex items-start gap-2">
                <Icon name="check" size={14} className="mt-0.5 text-emerald-500" />
                {instruction}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold text-zinc-900">Your response</h4>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                wordCount >= targetMin && wordCount <= targetMax
                  ? "bg-emerald-50 text-emerald-600"
                  : wordCount > 0
                    ? "bg-amber-50 text-amber-600"
                    : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {wordCount} words
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your answer here…"
            rows={10}
            className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 text-[15px] leading-7 text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-blue-400 focus:bg-white"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={analyze}
              disabled={wordCount === 0}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="sparkles" size={15} />
              Get AI preview
            </button>
            <span className="text-xs text-zinc-400">
              {sentences} sentences · {paragraphs}{" "}
              {paragraphs === 1 ? "paragraph" : "paragraphs"}
            </span>
          </div>
        </div>
      </div>
      {/* Feedback + sample */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h4 className="flex items-center gap-2 font-semibold text-zinc-900">
            <Icon name="bar-chart" size={18} className="text-blue-600" />
            Scoring preview
          </h4>
          {feedback ? (
            <div className="mt-4 space-y-4">
              {feedback.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-zinc-700">{row.label}</span>
                    <span className="text-xs font-bold text-blue-600">{row.pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{row.note}</p>
                </div>
              ))}
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                Preview only — the full exam uses the official CELPIP Writing rubric.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Write your response on the left, then tap{" "}
              <span className="font-semibold text-zinc-700">Get AI preview</span> to see
              heuristic feedback on length, cohesion, and structure.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <button
            type="button"
            onClick={() => setShowSample((v) => !v)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <span className="flex items-center gap-2 font-semibold text-zinc-900">
              <Icon name="bulb" size={18} className="text-amber-500" />
              Model answer
            </span>
            <Icon
              name="chevron-down"
              size={16}
              className={`text-zinc-400 transition-transform ${showSample ? "rotate-180" : ""}`}
            />
          </button>
          {showSample ? (
            <p className="mt-4 whitespace-pre-line rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 text-sm leading-7 text-zinc-600">
              {task.sampleAnswer}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h4 className="font-semibold text-zinc-900">How this task is marked</h4>
          <ul className="mt-3 divide-y divide-zinc-100">
            {task.criteria.map((c) => (
              <li key={c.label} className="flex items-start gap-3 py-3 text-sm">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">
                  ✓
                </span>
                <span>
                  <span className="font-semibold text-zinc-800">{c.label}</span>
                  <br />
                  <span className="text-zinc-500">{c.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

