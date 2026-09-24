"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { MockExam, MockSection, PracticeQuestion } from "@/data/practice";
import { buildReport, clbLabel, type ExamReport } from "@/lib/scoring";
import { Icon } from "@/components/icons";
import { DialogueAudioPlayer } from "@/components/practice/DialogueAudioPlayer";
import type { AudioEntry } from "@/data/practice/audio-manifest";

const SKILL_LABEL = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
} as const;

const SKILL_ICON = {
  listening: "headphones",
  reading: "book",
  writing: "pen",
  speaking: "mic",
} as const;

const LETTERS = ["A", "B", "C", "D"];

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

type Attempt = {
  sectionIndex: number;
  phase: "intro" | "running" | "results";
  answers: Record<string, number | null>;
  writingTexts: Record<string, string>;
  speakingClbs: Record<string, number | null>;
  timeLeft: number;
  timeUsed: Record<string, number>;
  report: ExamReport | null;
};

function storageKey(examId: string): string {
  return `linguaband.mock.attempt.${examId}`;
}

function emptyAttempt(exam: MockExam): Attempt {
  return {
    sectionIndex: 0,
    phase: "intro",
    answers: {},
    writingTexts: {},
    speakingClbs: {},
    timeLeft: exam.sections[0]?.timeLimitSec ?? 0,
    timeUsed: {},
    report: null,
  };
}

function readStoredAttempt(exam: MockExam): Attempt {
  if (typeof window === "undefined") return emptyAttempt(exam);
  try {
    const raw = window.localStorage.getItem(storageKey(exam.id));
    if (raw) {
      return { ...emptyAttempt(exam), ...(JSON.parse(raw) as Partial<Attempt>) };
    }
  } catch {
    /* ignore malformed storage */
  }
  return emptyAttempt(exam);
}

/** Record the current section's time, advance the index, or finish into results. */
function submitCurrent(prev: Attempt, exam: MockExam): Attempt {
  const section = exam.sections[prev.sectionIndex];
  if (!section) return prev;
  const timeUsed = {
    ...prev.timeUsed,
    [section.id]: Math.max(0, section.timeLimitSec - prev.timeLeft),
  };
  const isLast = prev.sectionIndex >= exam.sections.length - 1;
  if (isLast) {
    const report = buildReport({
      exam,
      answers: prev.answers,
      writingTexts: prev.writingTexts,
      speakingClbs: prev.speakingClbs,
      timeUsed,
    });
    return { ...prev, phase: "results", timeUsed, report };
  }
  const nextIndex = prev.sectionIndex + 1;
  return {
    ...prev,
    sectionIndex: nextIndex,
    timeLeft: exam.sections[nextIndex].timeLimitSec,
    timeUsed,
  };
}

export function MockExamPlayer({
  exam,
  audioEntries,
  source,
}: {
  exam: MockExam;
  audioEntries?: Record<string, AudioEntry>;
  source?: "stored" | "builtin";
}) {
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [attempt, setAttempt] = useState<Attempt>(() => readStoredAttempt(exam));

  const section: MockSection | undefined = exam.sections[attempt.sectionIndex];
  const totalSeconds = exam.sections.reduce((sum, s) => sum + s.timeLimitSec, 0);

  // Persist on every change (after hydration) so progress survives a reload.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey(exam.id), JSON.stringify(attempt));
    } catch {
      /* storage may be full or blocked */
    }
  }, [attempt, hydrated, exam.id]);

  // Section countdown. Auto-submits the section when time reaches zero.
  useEffect(() => {
    if (attempt.phase !== "running" || !hydrated) return;
    const id = window.setInterval(() => {
      setAttempt((prev) => {
        if (prev.phase !== "running") return prev;
        const next = prev.timeLeft - 1;
        if (next <= 0) return submitCurrent(prev, exam);
        return { ...prev, timeLeft: next };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [attempt.phase, hydrated, exam]);

  function start() {
    setAttempt((prev) => ({
      ...prev,
      phase: "running",
      sectionIndex: 0,
      timeLeft: exam.sections[0].timeLimitSec,
      report: null,
    }));
  }

  function reset() {
    const fresh = emptyAttempt(exam);
    try {
      window.localStorage.removeItem(storageKey(exam.id));
    } catch {
      /* ignore */
    }
    setAttempt(fresh);
  }

  if (!hydrated) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Icon name="clock" size={28} className="animate-pulse text-zinc-300" />
      </div>
    );
  }

  if (attempt.phase === "results" && attempt.report) {
    return <ResultsView report={attempt.report} onRetry={reset} />;
  }

  if (attempt.phase === "intro" || !section) {
    return (
      <IntroView
        exam={exam}
        totalSeconds={totalSeconds}
        onStart={start}
      />
    );
  }

  return (
    <RunningView
      exam={exam}
      section={section}
      attempt={attempt}
      audioEntries={audioEntries}
      source={source}
      onAnswer={(questionId, value) =>
        setAttempt((prev) => ({ ...prev, answers: { ...prev.answers, [questionId]: value } }))
      }
      onWrite={(text) =>
        setAttempt((prev) => ({
          ...prev,
          writingTexts: { ...prev.writingTexts, [section.id]: text },
        }))
      }
      onSpeak={(clb) =>
        setAttempt((prev) => ({
          ...prev,
          speakingClbs: { ...prev.speakingClbs, [section.id]: clb },
        }))
      }
      onNext={() => setAttempt((prev) => submitCurrent(prev, exam))}
    />
  );
}

function IntroView({
  exam,
  totalSeconds,
  onStart,
}: {
  exam: MockExam;
  totalSeconds: number;
  onStart: () => void;
}) {
  const skills = ["Listening", "Reading", "Writing", "Speaking"];
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-10 sm:py-16">
      <Link
        href="/exams"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <Icon name="arrow-right" size={14} className="rotate-180" /> All mock exams
      </Link>

      <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon name="clipboard-list" size={26} />
        </span>
        <span
          className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            exam.difficulty === "Challenging" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
          }`}
        >
          {exam.badge}
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold text-zinc-900">{exam.name}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">{exam.description}</p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: "layers" as const, value: String(exam.sections.length), label: "Sections" },
            { icon: "clock" as const, value: fmt(totalSeconds), label: "Total time" },
            { icon: "quiz" as const, value: String(exam.sections.reduce((n, s) => n + s.questions.length, 0)), label: "MCQ items" },
            { icon: "bar-chart" as const, value: "CLB", label: "Scoring" },
          ].map((cell) => (
            <div key={cell.label} className="rounded-2xl bg-zinc-50 p-4">
              <Icon name={cell.icon} size={18} className="mx-auto text-blue-600" />
              <p className="mt-2 font-display text-lg font-bold text-zinc-900">{cell.value}</p>
              <p className="text-xs text-zinc-500">{cell.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          Order: {skills.join(" → ")}. Each section is timed separately.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-[15px] font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
          >
            <Icon name="play" size={16} /> Start mock exam
          </button>
        </div>
      </div>
    </div>
  );
}

function RunningView({
  exam,
  section,
  attempt,
  audioEntries,
  source,
  onAnswer,
  onWrite,
  onSpeak,
  onNext,
}: {
  exam: MockExam;
  section: MockSection;
  attempt: Attempt;
  audioEntries?: Record<string, AudioEntry>;
  source?: "stored" | "builtin";
  onAnswer: (questionId: string, value: number | null) => void;
  onWrite: (text: string) => void;
  onSpeak: (clb: number | null) => void;
  onNext: () => void;
}) {
  const isLast = attempt.sectionIndex >= exam.sections.length - 1;
  const answered = section.questions.filter((q) => attempt.answers[q.id] != null).length;
  const lowTime = attempt.timeLeft <= 60;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/exams"
              aria-label="Exit exam"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900"
            >
              <Icon name="x" size={16} />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">{exam.name}</p>
              <p className="text-xs text-zinc-400">
                Section {attempt.sectionIndex + 1} of {exam.sections.length} ·{" "}
                {SKILL_LABEL[section.skill]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-zinc-200 px-3.5 py-1.5">
            <Icon name="clock" size={15} className={lowTime ? "text-rose-500" : "text-zinc-500"} />
            <span className={`font-display text-sm font-bold tabular-nums ${lowTime ? "text-rose-500" : "text-zinc-900"}`}>
              {fmt(attempt.timeLeft)}
            </span>
          </div>
        </div>
        <div className="h-1 w-full bg-zinc-100">
          <div
            className="h-1 bg-blue-600 transition-all duration-300"
            style={{ width: `${((attempt.sectionIndex + 1) / exam.sections.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
            <Icon name={SKILL_ICON[section.skill]} size={13} />
            {section.title}
          </span>
          {section.skill === "listening" || section.skill === "reading" ? (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500">
              {answered}/{section.questions.length} answered
            </span>
          ) : null}
        </div>

        {section.skill === "listening" || section.skill === "reading" ? (
          <McqSectionView
            section={section}
            answers={attempt.answers}
            onAnswer={onAnswer}
            audioEntry={audioEntries?.[section.id]}
            source={source}
          />
        ) : null}

        {section.skill === "writing" && section.writingTask ? (
          <WritingSectionView
            section={section}
            value={attempt.writingTexts[section.id] ?? ""}
            onChange={onWrite}
          />
        ) : null}

        {section.skill === "speaking" && section.speakingTask ? (
          <SpeakingSectionView
            section={section}
            clb={attempt.speakingClbs[section.id] ?? null}
            onChange={onSpeak}
          />
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-400">{section.instructions}</p>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            {isLast ? (
              <>
                <Icon name="send" size={15} /> Submit exam
              </>
            ) : (
              <>
                Next section <Icon name="arrow-right" size={15} />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

function McqSectionView({
  section,
  answers,
  onAnswer,
  audioEntry,
  source,
}: {
  section: MockSection;
  answers: Record<string, number | null>;
  onAnswer: (questionId: string, value: number | null) => void;
  audioEntry?: AudioEntry;
  source?: "stored" | "builtin";
}) {
  if (section.skill === "listening") {
    return (
      <div className="space-y-6">
        <DialogueAudioPlayer key={section.id} id={section.id} transcript={section.passage ?? ""} mode="exam" entry={audioEntry} source={source} />
        <div className="space-y-5">
          {section.questions.map((question, i) => (
            <QuestionCard
              key={question.id}
              index={i}
              question={question}
              selected={answers[question.id] ?? null}
              onSelect={(v) => onAnswer(question.id, v)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Reading passage</p>
            <h3 className="mt-0.5 font-display text-lg font-bold text-zinc-900">{section.passageTitle}</h3>
          </div>
          <div className="p-5">
            <div className="max-h-[22rem] overflow-y-auto pr-2">
              <p className="whitespace-pre-line text-[15px] leading-8 text-zinc-700">{section.passage}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-3">
        <div className="space-y-5">
          {section.questions.map((question, i) => (
            <QuestionCard
              key={question.id}
              index={i}
              question={question}
              selected={answers[question.id] ?? null}
              onSelect={(v) => onAnswer(question.id, v)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestionCard({
  index,
  question,
  selected,
  onSelect,
}: {
  index: number;
  question: PracticeQuestion;
  selected: number | null;
  onSelect: (value: number | null) => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-[15px] font-semibold leading-6 text-zinc-900">
        <span className="mr-2 font-display text-blue-600">{index + 1}.</span>
        {question.question}
      </p>
      <div className="mt-3 space-y-2">
        {question.options.map((option, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm leading-6 text-zinc-700 transition-all ${
                isSelected ? "border-blue-400 bg-blue-50" : "border-zinc-200 hover:border-blue-300 hover:bg-blue-50/40"
              }`}
            >
              <span
                className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                  isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 text-zinc-500"
                }`}
              >
                {LETTERS[i]}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WritingSectionView({
  section,
  value,
  onChange,
}: {
  section: MockSection;
  value: string;
  onChange: (text: string) => void;
}) {
  const task = section.writingTask;
  if (!task) return null;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{task.task}</p>
        <h3 className="mt-1 font-display text-xl font-bold text-zinc-900">{task.title}</h3>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-zinc-500">
          <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1">
            <Icon name="clock" size={13} /> {task.timeLimit}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1">
            <Icon name="target" size={13} /> {task.wordTarget}
          </span>
        </div>
        <div className="mt-4 rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Task</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-7 text-zinc-700">{task.scenario}</p>
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Remember to</p>
          <ul className="mt-2 space-y-2">
            {task.instructions.map((step) => (
              <li key={step} className="flex items-start gap-2 text-sm leading-6 text-zinc-600">
                <Icon name="check" size={15} className="mt-1 shrink-0 text-blue-500" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold text-zinc-900">Your answer</h4>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${wordCount > 0 ? "bg-blue-50 text-blue-600" : "bg-zinc-100 text-zinc-400"}`}>
              {wordCount} words
            </span>
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={12}
            placeholder="Type your response here…"
            className="w-full rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-7 text-zinc-800 outline-none transition-colors placeholder:text-zinc-300 focus:border-blue-400"
          />
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h4 className="font-semibold text-zinc-900">How this task is marked</h4>
          <ul className="mt-3 divide-y divide-zinc-100">
            {task.criteria.map((c) => (
              <li key={c.label} className="flex items-start gap-3 py-3 text-sm">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">✓</span>
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

function SpeakingSectionView({
  section,
  clb,
  onChange,
}: {
  section: MockSection;
  clb: number | null;
  onChange: (clb: number | null) => void;
}) {
  const task = section.speakingTask;
  const [phase, setPhase] = useState<"idle" | "prep" | "speaking" | "done">("idle");
  const [left, setLeft] = useState(task?.prepTimeSec ?? 0);
  const [showSample, setShowSample] = useState(false);

  useEffect(() => {
    if (phase === "idle" || phase === "done") return;
    const id = window.setInterval(() => {
      setLeft((s) => {
        const next = s - 1;
        if (next <= 0) {
          window.clearInterval(id);
          if (phase === "prep") {
            setPhase("speaking");
            return task?.speakTimeSec ?? 0;
          }
          setPhase("done");
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, task?.speakTimeSec]);

  if (!task) return null;

  const start = () => {
    setLeft(task.prepTimeSec);
    setPhase("prep");
  };

  const meta = {
    idle: { label: "Ready to start", color: "text-zinc-500" },
    prep: { label: "Prep time", color: "text-amber-600" },
    speaking: { label: "Speaking", color: "text-blue-600" },
    done: { label: "Finished — now self-assess", color: "text-emerald-600" },
  }[phase];

  const clbOptions = [4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">{task.title}</p>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-700">{task.scenario}</p>

          <div className="mt-5 flex items-center gap-4">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-4 border-zinc-100">
              <span className="font-display text-2xl font-bold text-zinc-900">
                {phase === "idle" ? `${task.prepTimeSec + task.speakTimeSec}s` : fmt(left)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className={`inline-flex items-center gap-2 text-sm font-semibold ${meta.color}`}>
                <span className={`h-2 w-2 rounded-full ${phase === "speaking" ? "animate-pulse bg-rose-500" : phase === "done" ? "bg-emerald-500" : "bg-zinc-300"}`} />
                {meta.label}
              </span>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">Prep: {task.prepTimeSec}s</span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">Speak: {task.speakTimeSec}s</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {phase === "idle" || phase === "done" ? (
              <button
                type="button"
                onClick={start}
                className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
              >
                <Icon name={phase === "done" ? "refresh" : "record"} size={15} />
                {phase === "done" ? "Restart task" : "Start task"}
              </button>
            ) : null}
            {phase === "speaking" ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
                <span className="h-2 w-2 animate-ping rounded-full bg-rose-500" /> Recording…
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

      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h4 className="flex items-center gap-2 font-semibold text-zinc-900">
            <Icon name="mic" size={18} className="text-violet-600" />
            Self-assess your CLB
          </h4>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Compare your answer to the sample below, then pick the level closest to yours.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {clbOptions.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange(level)}
                className={`rounded-full border px-2 py-2 text-sm font-bold transition-colors ${
                  clb === level
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-zinc-200 text-zinc-600 hover:border-violet-300"
                }`}
              >
                CLB {level}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="mt-2 text-xs font-semibold text-zinc-400 underline underline-offset-4 hover:text-zinc-600"
          >
            Skip (not assessed)
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <button
            type="button"
            onClick={() => setShowSample((v) => !v)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <span className="flex items-center gap-2 font-semibold text-zinc-900">
              <Icon name="bulb" size={18} className="text-amber-500" /> Sample response
            </span>
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-600">
              {task.clb}
            </span>
          </button>
          {showSample ? (
            <p className="mt-4 whitespace-pre-line rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 text-sm leading-7 text-zinc-600">
              {task.sampleAnswer}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ResultsView({ report, onRetry }: { report: ExamReport; onRetry: () => void }) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const overallTone =
    (report.overallClb ?? 0) >= 9 ? "text-emerald-600" : (report.overallClb ?? 0) >= 7 ? "text-blue-600" : "text-amber-600";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon name="trophy" size={26} />
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold text-zinc-900">{report.examName}</h1>
        <p className="mt-1 text-sm text-zinc-500">Your estimated results</p>
        <p className={`mt-3 font-display text-5xl font-bold ${overallTone}`}>
          CLB {clbLabel(report.overallClb)}
        </p>
        <p className="mt-2 text-xs text-zinc-400">
          Estimated overall level — for practice feedback only, not an official result.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {report.skills.map((skill) => (
          <div key={skill.skill} className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
            <Icon name={SKILL_ICON[skill.skill]} size={18} className="mx-auto text-blue-600" />
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {skill.label}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-zinc-900">
              {clbLabel(skill.clb)}
            </p>
            {skill.skill === "listening" || skill.skill === "reading" ? (
              <p className="mt-0.5 text-[11px] text-zinc-400">
                {skill.raw}/{skill.max} correct
              </p>
            ) : skill.skill === "writing" ? (
              <p className="mt-0.5 text-[11px] text-zinc-400">heuristic estimate</p>
            ) : (
              <p className="mt-0.5 text-[11px] text-zinc-400">self-assessed</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-xl font-bold text-zinc-900">Section review</h2>
        <div className="space-y-3">
          {report.sections.map((section) => {
            const isOpen = openSection === section.sectionId;
            const score = section.items
              ? `${section.items.filter((i) => i.selected === i.question.answerIndex).length}/${section.items.length}`
              : section.writing
                ? `${section.writing.pct}%`
                : section.speakingClb !== null && section.speakingClb !== undefined
                  ? `CLB ${section.speakingClb}`
                  : "—";
            return (
              <div key={section.sectionId} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenSection(isOpen ? null : section.sectionId)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Icon name={SKILL_ICON[section.skill]} size={16} className="shrink-0 text-zinc-400" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-zinc-900">{section.title}</span>
                      <span className="text-xs text-zinc-400">
                        {fmt(section.timeUsedSec)} used · {fmt(section.timeLimitSec)} allowed
                      </span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600">{score}</span>
                    <Icon name="chevron-down" size={16} className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </span>
                </button>
                {isOpen ? <SectionDetail section={section} /> : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          <Icon name="refresh" size={15} /> Retake exam
        </button>
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400"
        >
          Back to exams
        </Link>
      </div>
    </div>
  );
}

function SectionDetail({ section }: { section: ExamReport["sections"][number] }) {
  if (section.items) {
    return (
      <div className="space-y-3 border-t border-zinc-100 px-5 py-4">
        {section.items.map((item, i) => {
          const ok = item.selected === item.question.answerIndex;
          return (
            <div
              key={item.question.id}
              className={`rounded-xl border p-4 ${ok ? "border-emerald-200 bg-emerald-50/40" : "border-rose-200 bg-rose-50/40"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-zinc-900">
                  {i + 1}. {item.question.question}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                >
                  {ok ? "Correct" : "Incorrect"}
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {item.selected !== null && !ok ? `Your answer: ${LETTERS[item.selected]} · ` : null}
                Correct answer: {LETTERS[item.question.answerIndex]}
              </p>
              <p className="mt-1.5 text-xs leading-5 text-zinc-500">{item.question.explanation}</p>
            </div>
          );
        })}
      </div>
    );
  }

  if (section.writing) {
    return (
      <div className="border-t border-zinc-100 px-5 py-4">
        <div className="space-y-3">
          {[
            { label: "Length", pct: section.writing.length },
            { label: "Cohesion", pct: section.writing.cohesion },
            { label: "Structure", pct: section.writing.structure },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-700">{row.label}</span>
                <span className="text-xs font-bold text-blue-600">{row.pct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        {section.writingText ? (
          <p className="mt-4 whitespace-pre-line rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 text-sm leading-7 text-zinc-600">
            {section.writingText}
          </p>
        ) : (
          <p className="mt-4 text-xs text-zinc-400">No response submitted.</p>
        )}
      </div>
    );
  }

  if (section.speakingClb !== null && section.speakingClb !== undefined) {
    return (
      <div className="border-t border-zinc-100 px-5 py-4">
        <p className="text-sm text-zinc-600">
          Self-assessed level: <span className="font-bold text-zinc-900">CLB {section.speakingClb}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-zinc-100 px-5 py-4">
      <p className="text-sm text-zinc-400">Not assessed.</p>
    </div>
  );
}








