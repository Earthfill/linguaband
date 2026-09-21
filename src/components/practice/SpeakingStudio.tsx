"use client";

import { useEffect, useRef, useState } from "react";
import type { SpeakingTask } from "@/data/practice";
import { Icon } from "@/components/icons";

type Phase = "idle" | "prep" | "speaking" | "done";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toString().padStart(2, "0");
  return m > 0 ? `${m}:${sec}` : `0:${sec}`;
}

const CIRC = 326.7; // circumference of r=52 ring

export function SpeakingStudio({ task }: { task: SpeakingTask }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [left, setLeft] = useState(task.prepTimeSec);
  const leftRef = useRef(task.prepTimeSec);

  const total = phase === "speaking" ? task.speakTimeSec : task.prepTimeSec;

  useEffect(() => {
    if (phase === "idle" || phase === "done") return;
    const id = window.setInterval(() => {
      leftRef.current -= 1;
      setLeft(leftRef.current);
      if (leftRef.current <= 0) {
        window.clearInterval(id);
        if (phase === "prep") {
          leftRef.current = task.speakTimeSec;
          setLeft(task.speakTimeSec);
          setPhase("speaking");
        } else {
          setPhase("done");
        }
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, task.speakTimeSec]);

  function start() {
    leftRef.current = task.prepTimeSec;
    setLeft(task.prepTimeSec);
    setPhase("prep");
  }

  function reset() {
    leftRef.current = task.prepTimeSec;
    setLeft(task.prepTimeSec);
    setPhase("idle");
  }

  const meta: Record<Phase, { label: string; color: string; dot: string }> = {
    idle: { label: "Ready to start", color: "text-zinc-500", dot: "bg-zinc-300" },
    prep: { label: "Prep time", color: "text-amber-600", dot: "bg-amber-400" },
    speaking: { label: "Speaking", color: "text-blue-600", dot: "bg-blue-500" },
    done: { label: "Finished", color: "text-emerald-600", dot: "bg-emerald-500" },
  };
  const m = meta[phase];
  const dash = `${(Math.max(left, 0) / total) * CIRC} ${CIRC}`;
  const ringColor =
    phase === "speaking"
      ? "#2563eb"
      : phase === "prep"
        ? "#f59e0b"
        : phase === "done"
          ? "#10b981"
          : "#d4d4d8";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Scenario + timer */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
            {task.title}
          </p>

          <div className="mt-5 flex items-center gap-6">
            {/* Timer ring */}
            <div className="relative grid h-32 w-32 shrink-0 place-items-center">
              <svg viewBox="0 0 116 116" className="h-32 w-32 -rotate-90">
                <circle cx="58" cy="58" r="52" fill="none" stroke="#f4f4f5" strokeWidth="10" />
                <circle
                  cx="58"
                  cy="58"
                  r="52"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={dash}
                />
              </svg>
              <span className="absolute font-display text-2xl font-bold text-zinc-900">
                {phase === "idle" ? `${total}s` : fmt(left)}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <span className={`inline-flex items-center gap-2 text-sm font-semibold ${m.color}`}>
                <span
                  className={`h-2 w-2 rounded-full ${m.dot} ${phase === "speaking" ? "animate-pulse" : ""}`}
                />
                {m.label}
              </span>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-700">
                {task.scenario}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                  Prep: {task.prepTimeSec}s
                </span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                  Speak: {task.speakTimeSec}s
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {phase === "idle" ? (
              <button
                type="button"
                onClick={start}
                className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
              >
                <Icon name="record" size={15} />
                Start task
              </button>
            ) : (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                <Icon name="refresh" size={15} />
                Reset
              </button>
            )}
            {phase === "speaking" ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
                <span className="h-2 w-2 animate-ping rounded-full bg-rose-500" />
                Recording…
              </span>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h4 className="font-semibold text-zinc-900">Structuring your answer</h4>
          <ul className="mt-3 space-y-2.5">
            {task.tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-sm leading-6 text-zinc-600">
                <Icon name="check" size={15} className="mt-1 shrink-0 text-violet-500" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sample answer */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h4 className="flex items-center gap-2 font-semibold text-zinc-900">
            <Icon name="mic" size={18} className="text-violet-600" />
            Sample response
          </h4>
          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-600">
            {task.clb}
          </span>
        </div>
        <p className="mt-4 whitespace-pre-line rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 text-sm leading-7 text-zinc-600">
          {task.sampleAnswer}
        </p>
      </div>
    </div>
  );
}

