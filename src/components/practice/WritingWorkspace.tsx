"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { WritingTask } from "@/data/practice";
import { Icon } from "@/components/icons";

const discourseMarkers = [
  "first", "second", "third", "finally", "however", "therefore", "additionally",
  "for example", "in addition", "as a result", "moreover", "furthermore",
];

type FeedbackBars = { label: string; pct: number; note: string };
type AiFeedback = {
  overall: string;
  strengths: string[];
  improvements: string[];
  criteria: { label: string; score: number; feedback: string }[];
  corrections: { original: string; suggestion: string; reason: string }[];
};
type FeedbackQuota = {
  authenticated: boolean;
  email?: string;
  successfulReviews?: number;
  remaining?: number;
  cooldownUntil?: number | null;
};

async function loadFeedbackQuota(taskId: string): Promise<FeedbackQuota | null> {
  try {
    const response = await fetch(`/api/writing-feedback?taskId=${encodeURIComponent(taskId)}`);
    const result = await response.json().catch(() => null) as FeedbackQuota | null;
    if (response.status === 401) return { authenticated: false };
    return response.ok ? result : null;
  } catch {
    return null;
  }
}

export function WritingWorkspace({ task }: { task: WritingTask }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackBars[] | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quota, setQuota] = useState<FeedbackQuota | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(true);

  const draftKey = `linguaband.writing.draft.${task.task}.${task.title}`;

  useEffect(() => {
    try {
      // Restore browser-only data after mount to keep server and client markup consistent.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(window.localStorage.getItem(draftKey) ?? "");
    } catch {
      /* storage may be unavailable */
    } finally {
      setIsDraftLoaded(true);
    }
  }, [draftKey]);

  useEffect(() => {
    if (!isDraftLoaded) return;
    try {
      window.localStorage.setItem(draftKey, text);
    } catch {
      /* storage may be full or blocked */
    }
  }, [draftKey, isDraftLoaded, text]);

  useEffect(() => {
    let cancelled = false;
    loadFeedbackQuota(task.id)
      .then((result) => { if (!cancelled) setQuota(result); })
      .finally(() => {
        if (!cancelled) setQuotaLoading(false);
      });
    return () => { cancelled = true; };
  }, [task.id]);

  const wordCount = useMemo(
    () => (text.trim() ? text.trim().split(/\s+/).length : 0),
    [text],
  );
  const sentences = useMemo(
    () => (text.match(/[.!?]+/g) ?? []).length,
    [text],
  );
  const paragraphs = useMemo(
    () => (text.trim() ? text.split(/\r?\n/).filter((paragraph) => paragraph.trim()).length : 0),
    [text],
  );

  const [targetMin, targetMax] = useMemo(() => {
    const words = task.wordTarget.match(/\d+/g)?.map(Number) ?? [150, 150];
    return [words[0] ?? 150, words[1] ?? words[0] ?? 200];
  }, [task.wordTarget]);

  async function analyze() {
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

    setIsAnalyzing(true);
    setAiFeedback(null);
    setFeedbackError(null);
    try {
      const response = await fetch("/api/writing-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, task }),
      });
      const result = (await response.json().catch(() => null)) as {
        feedback?: AiFeedback;
        error?: string;
        signInRequired?: boolean;
        quota?: FeedbackQuota;
      } | null;
      if (!response.ok || !result?.feedback) {
        if (response.status === 401 || result?.signInRequired) {
          router.push(`/login?returnTo=${encodeURIComponent(`/writing?taskId=${task.id}`)}`);
          return;
        }
        throw new Error(result?.error || "AI feedback is temporarily unavailable.");
      }
      setAiFeedback(result.feedback);
      if (result.quota) setQuota({ ...result.quota, authenticated: true, email: quota?.email });
      else setQuota(await loadFeedbackQuota(task.id));
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "AI feedback is temporarily unavailable.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  const cooldownDate = quota?.cooldownUntil
    ? new Date(quota.cooldownUntil * 1000).toLocaleString()
    : null;

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
            onChange={(e) => {
              setText(e.target.value);
              setAiFeedback(null);
              setFeedbackError(null);
            }}
            placeholder="Type your answer here…"
            rows={10}
            className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 text-[15px] leading-7 text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-blue-400 focus:bg-white"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={analyze}
              disabled={wordCount === 0 || isAnalyzing || quotaLoading || !quota?.authenticated || (quota.remaining ?? 0) <= 0}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="sparkles" size={15} />
              {isAnalyzing ? "Reviewing…" : quotaLoading ? "Checking sign-in…" : quota?.authenticated === false ? "Sign in to get AI feedback" : "Get AI feedback"}
            </button>
            {quota?.authenticated === false ? (
              <a href={`/login?returnTo=${encodeURIComponent(`/writing?taskId=${task.id}`)}`} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Sign in to use AI feedback</a>
            ) : quota === null && !quotaLoading ? (
              <span role="status" className="text-xs text-amber-700">
                Could not verify AI review availability. Refresh the page and try again.
              </span>
            ) : quota?.authenticated ? (
              <span className="text-xs text-zinc-500" aria-live="polite">
                {quota.email ? `${quota.email} · ` : ""}
                {quota.remaining ?? 3} of 3 AI reviews left
                {cooldownDate && (quota.remaining ?? 0) === 0 ? ` · Available ${cooldownDate}` : ""}
              </span>
            ) : null}
            {quota?.authenticated ? (
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="text-xs font-semibold text-zinc-500 hover:text-zinc-800">Sign out</button>
              </form>
            ) : null}
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
                Practice feedback only — this is AI-assisted and is not an official CELPIP score.
              </p>
              {feedbackError ? (
                <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                  {feedbackError} Showing the basic writing checks above instead.
                </p>
              ) : null}
              {quota?.authenticated && quota.remaining === 0 && cooldownDate ? (
                <p role="status" className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-800">
                  You’ve used all 3 successful AI reviews for this task. Your allowance resets {cooldownDate}.
                </p>
              ) : null}
              {aiFeedback ? (
                <div className="space-y-4 border-t border-zinc-100 pt-4">
                  <div>
                    <h5 className="text-sm font-bold text-zinc-800">AI review</h5>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">{aiFeedback.overall}</p>
                  </div>
                  {aiFeedback.criteria.length ? (
                    <div>
                      <h6 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Task criteria</h6>
                      <ul className="mt-2 space-y-2">
                        {aiFeedback.criteria.map((criterion, index) => (
                          <li key={`${criterion.label}-${index}`} className="rounded-lg bg-zinc-50 p-3">
                            <p className="text-sm font-semibold text-zinc-800">{criterion.label} <span className="text-blue-600">{criterion.score}/100</span></p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">{criterion.feedback}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {aiFeedback.strengths.length ? (
                    <div>
                      <h6 className="text-xs font-bold uppercase tracking-wide text-emerald-700">What’s working</h6>
                      <ul className="mt-1 list-inside list-disc space-y-1 text-sm leading-5 text-zinc-600">
                        {aiFeedback.strengths.map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    </div>
                  ) : null}
                  {aiFeedback.improvements.length ? (
                    <div>
                      <h6 className="text-xs font-bold uppercase tracking-wide text-amber-700">Next improvements</h6>
                      <ul className="mt-1 list-inside list-disc space-y-1 text-sm leading-5 text-zinc-600">
                        {aiFeedback.improvements.map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    </div>
                  ) : null}
                  {aiFeedback.corrections.length ? (
                    <div>
                      <h6 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Suggested corrections</h6>
                      <ul className="mt-2 space-y-2">
                        {aiFeedback.corrections.map((correction, index) => (
                          <li key={`${correction.original}-${index}`} className="rounded-lg border border-zinc-100 p-3 text-xs leading-5">
                            <p className="text-rose-700"><span className="font-semibold">Original:</span> {correction.original}</p>
                            <p className="mt-1 text-emerald-700"><span className="font-semibold">Suggestion:</span> {correction.suggestion}</p>
                            <p className="mt-1 text-zinc-500">{correction.reason}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Write your response on the left, then tap{" "}
              <span className="font-semibold text-zinc-700">Get AI feedback</span> to see
              writing checks and, when configured, AI suggestions for this response.
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

