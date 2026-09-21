"use client";

import { useState } from "react";
import type { PracticeQuestion } from "@/data/practice";
import { Icon } from "@/components/icons";

type McqPracticeProps = {
  questions: PracticeQuestion[];
  accent?: "blue" | "violet";
};

const accents = {
  blue: {
    option: "border-zinc-200 hover:border-blue-300 hover:bg-blue-50/40",
    active: "border-blue-400 bg-blue-50",
    correct: "border-emerald-400 bg-emerald-50",
    wrong: "border-rose-400 bg-rose-50",
    chip: "bg-blue-50 text-blue-600",
  },
  violet: {
    option: "border-zinc-200 hover:border-violet-300 hover:bg-violet-50/40",
    active: "border-violet-400 bg-violet-50",
    correct: "border-emerald-400 bg-emerald-50",
    wrong: "border-rose-400 bg-rose-50",
    chip: "bg-violet-50 text-violet-600",
  },
};

export function McqPractice({ questions, accent = "blue" }: McqPracticeProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = questions.length;
  const current = questions[index];
  const a = accents[accent];
  const letters = ["A", "B", "C", "D"];
  const isCorrect = selected === current.answerIndex;

  function check() {
    if (selected === null) return;
    setChecked(true);
    if (selected === current.answerIndex) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (index + 1 >= total) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setChecked(false);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setCorrectCount(0);
    setFinished(false);
  }

  if (finished) {
    const pct = Math.round((correctCount / total) * 100);
    const tone =
      pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-500";
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon name="trophy" size={28} />
        </span>
        <h3 className="mt-4 font-display text-2xl font-bold text-zinc-900">Session complete</h3>
        <p className={`mt-2 font-display text-4xl font-bold ${tone}`}>{pct}%</p>
        <p className="mt-1 text-sm text-zinc-500">
          You answered {correctCount} of {total} correctly.
        </p>
        <div className="mx-auto mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-zinc-100">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <button
          type="button"
          onClick={restart}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          <Icon name="refresh" size={15} />
          Practice again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${a.chip}`}>
            {current.part}
          </span>
        </div>
        <span className="text-sm font-semibold text-zinc-500">
          {index + 1} / {total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${((index + (checked ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mt-6">
        <h4 className="text-base font-semibold text-zinc-900 sm:text-lg">{current.question}</h4>

        <div className="mt-4 space-y-2.5">
          {current.options.map((option, i) => {
            let style = a.option;
            if (checked) {
              if (i === current.answerIndex) style = a.correct;
              else if (i === selected) style = a.wrong;
              else style = "border-zinc-200 opacity-60";
            } else if (i === selected) {
              style = a.active;
            }
            return (
              <button
                key={i}
                type="button"
                disabled={checked}
                onClick={() => setSelected(i)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm leading-6 text-zinc-700 transition-all disabled:cursor-default ${style}`}
              >
                <span
                  className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                    checked && i === current.answerIndex
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : checked && i === selected
                        ? "border-rose-500 bg-rose-500 text-white"
                        : i === selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-zinc-300 text-zinc-500"
                  }`}
                >
                  {checked && i === current.answerIndex ? (
                    <Icon name="check" size={13} />
                  ) : checked && i === selected ? (
                    <Icon name="x" size={13} />
                  ) : (
                    letters[i]
                  )}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Action row */}
        <div className="mt-5 flex items-center justify-between gap-3">
          {!checked ? (
            <button
              type="button"
              onClick={check}
              disabled={selected === null}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Check answer
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              {index + 1 >= total ? "Finish" : "Next question"}
              <Icon name="arrow-right" size={15} />
            </button>
          )}
          <span
            className={`text-sm font-semibold ${isCorrect && checked ? "text-emerald-600" : checked ? "text-rose-500" : "text-zinc-400"}`}
          >
            {checked
              ? isCorrect
                ? "Correct!"
                : `Correct answer: ${letters[current.answerIndex]}`
              : "Score 0"}
          </span>
        </div>

        {/* Explanation */}
        {checked ? (
          <div
            className={`mt-5 rounded-xl border p-4 text-sm leading-7 ${
              isCorrect
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <p className="flex items-center gap-2 font-semibold">
              <Icon name="bulb" size={16} />
              Why this answer
            </p>
            <p className="mt-1.5">{current.explanation}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
