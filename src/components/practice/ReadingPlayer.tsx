"use client";

import { useState } from "react";
import type { ReadingPassage } from "@/data/practice";
import { Icon } from "@/components/icons";
import { McqPractice } from "@/components/practice/McqPractice";

export function ReadingPlayer({ passage }: { passage: ReadingPassage }) {
  const [showPassage, setShowPassage] = useState(true);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {/* Passage panel */}
      <div className="lg:col-span-3">
        <div className="h-full rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                {passage.part}
              </p>
              <h3 className="mt-0.5 font-display text-lg font-bold text-zinc-900">
                {passage.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowPassage((v) => !v)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900"
            >
              <Icon
                name={showPassage ? "x" : "book"}
                size={13}
              />
              {showPassage ? "Close passage" : "Open passage"}
            </button>
          </div>

          {showPassage ? (
            <div className="p-5">
              <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                  {passage.wordCount} words
                </span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                  Suggested time: {passage.timeLimit}
                </span>
              </div>
              <div className="max-h-[22rem] overflow-y-auto pr-2">
                <p className="whitespace-pre-line text-[15px] leading-8 text-zinc-700">
                  {passage.passage}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid h-full min-h-[10rem] place-items-center p-6 text-sm text-zinc-400">
              Continue reading the text above? Re-open the passage to review quotes.
            </div>
          )}
        </div>
      </div>

      {/* Questions panel */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <McqPractice questions={passage.questions} accent="blue" />
        </div>
      </div>
    </div>
  );
}
