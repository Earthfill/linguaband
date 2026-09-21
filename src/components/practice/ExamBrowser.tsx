"use client";

import Link from "next/link";
import { mockExams } from "@/data/practice";
import type { MockSkill } from "@/data/practice";
import { Icon } from "@/components/icons";

const SKILL_LABEL: Record<MockSkill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

function formatDuration(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function ExamBrowser() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {mockExams.map((exam) => {
        const playable = exam.sections.length > 0;
        const totalSeconds = exam.sections.reduce((sum, s) => sum + s.timeLimitSec, 0);
        const mcqCount = exam.sections.reduce((sum, s) => sum + s.questions.length, 0);
        const skills = [...new Set(exam.sections.map((s) => SKILL_LABEL[s.skill]))].join(" · ");

        return (
          <article
            key={exam.id}
            className={`flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 ${
              playable ? "hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg" : "opacity-70"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-bold text-zinc-900">{exam.name}</h3>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                  exam.difficulty === "Challenging" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                }`}
              >
                {exam.badge}
              </span>
            </div>

            <p className="mt-2.5 flex-1 text-sm leading-6 text-zinc-500">{exam.description}</p>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4">
              {[
                { icon: "clock" as const, label: "Duration", value: playable ? formatDuration(totalSeconds) : "—" },
                { icon: "quiz" as const, label: "MCQ items", value: playable ? String(mcqCount) : "—" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                  <Icon name={row.icon} size={15} className="text-blue-600" />
                  <span>
                    <span className="block text-sm font-bold text-zinc-900">{row.value}</span>
                    <span className="block text-[11px] text-zinc-400">{row.label}</span>
                  </span>
                </div>
              ))}
            </dl>

            <div>
              <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-[11px] leading-4 text-zinc-500">
                {playable ? `${skills} · ${exam.sections.length} sections` : "Content coming soon"}
              </p>

              {playable ? (
                <Link
                  href={`/exams/${exam.id}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                >
                  <Icon name="play" size={14} />
                  Start mock exam
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-400"
                >
                  Coming soon
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
