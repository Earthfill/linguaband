"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { BankQuestion, ListeningTrack, ReadingPassage } from "@/data/practice";
import { Icon } from "@/components/icons";
import { McqPractice } from "@/components/practice/McqPractice";

type Skill = "All" | "Listening" | "Reading" | "Writing" | "Speaking";
type SetEntry = {
  id: string;
  title: string;
  part: string;
  skill: Exclude<Skill, "All">;
  text: string;
  imageUrl?: string;
  imageAlt?: string;
  audio?: ListeningTrack["audio"];
  audioId?: string;
  audioStatus?: ListeningTrack["audioStatus"];
  questions: BankQuestion[];
  href?: string;
};

export function QuestionBank({
  questions,
  sets,
}: {
  questions: BankQuestion[];
  sets: { listening: ListeningTrack[]; reading: ReadingPassage[] };
}) {
  const [skill, setSkill] = useState<Skill>("All");
  const [query, setQuery] = useState("");
  const [practicingSetId, setPracticingSetId] = useState<string | null>(null);

  const entries = useMemo<SetEntry[]>(() => [
    ...sets.listening.map((track) => ({
      id: `Listening:${track.id}`,
      title: track.title,
      part: track.part,
      skill: "Listening" as const,
      text: track.transcript,
      audio: track.audio,
      imageUrl: track.imageUrl,
      imageAlt: track.imageAlt,
      audioId: track.id,
      audioStatus: track.audioStatus,
      questions: questions.filter((q) => q.skill === "Listening" && q.setId === track.id),
    })),
    ...sets.reading.map((passage) => ({
      id: `Reading:${passage.id}`,
      title: passage.title,
      part: passage.part,
      skill: "Reading" as const,
      text: passage.passage,
      imageUrl: passage.imageUrl,
      imageAlt: passage.imageAlt,
      questions: questions.filter((q) => q.skill === "Reading" && q.setId === passage.id),
    })),
    ...questions.filter((q) => q.skill === "Writing" || q.skill === "Speaking").map((q) => ({
      id: `${q.skill}:${q.setId}`, title: q.source, part: q.part, skill: q.skill,
      text: q.question, questions: [q],
      href: q.skill === "Writing" ? `/writing?taskId=${encodeURIComponent(q.setId)}` : "/speaking",
    })),
  ], [questions, sets]);

  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.flatMap((entry) => {
      if (skill !== "All" && entry.skill !== skill) return [];
      const setMatches = needle.length > 0 &&
        `${entry.title} ${entry.part} ${entry.text}`.toLowerCase().includes(needle);
      const matchingQuestions = needle && !setMatches
        ? entry.questions.filter((q) => `${q.question} ${q.part} ${q.options.join(" ")}`.toLowerCase().includes(needle))
        : entry.questions;
      if (needle && !setMatches && matchingQuestions.length === 0) return [];
      return [{ ...entry, questions: matchingQuestions }];
    });
  }, [entries, skill, query]);

  const filtered = filteredEntries.flatMap((entry) => entry.questions);
  const practicingEntry = entries.find((entry) => entry.id === practicingSetId);

  const counts = useMemo(
    () => ({
      All: entries.length,
      Listening: sets.listening.length,
      Reading: sets.reading.length,
      Writing: entries.filter((entry) => entry.skill === "Writing").length,
      Speaking: entries.filter((entry) => entry.skill === "Speaking").length,
    }),
    [entries, sets],
  );

  if (practicingEntry) {
    return (
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPracticingSetId(null)}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400"
          >
            <Icon name="arrow-right" size={14} className="rotate-180" />
            Back to bank
          </button>
          <p className="text-sm text-zinc-500">
            Practicing {practicingEntry.questions.length} question{practicingEntry.questions.length === 1 ? "" : "s"} · {practicingEntry.title}
          </p>
        </div>
        {practicingEntry.skill === "Writing" || practicingEntry.skill === "Speaking" ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <span className="text-xs font-bold uppercase tracking-wide text-blue-600">{practicingEntry.skill} prompt</span>
            <h2 className="mt-2 font-display text-xl font-bold text-zinc-900">{practicingEntry.title}</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-700">{practicingEntry.text}</p>
            <Link href={practicingEntry.href!} className="mt-5 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Open {practicingEntry.skill} practice</Link>
          </div>
        ) : <McqPractice
          key={practicingEntry.id}
          questions={practicingEntry.questions}
          accent={practicingEntry.skill === "Listening" ? "violet" : "blue"}
          context={{
            title: practicingEntry.title,
            text: practicingEntry.text,
            label: practicingEntry.skill === "Listening" ? "Listening transcript" : "Reading passage",
            imageUrl: practicingEntry.imageUrl,
            imageAlt: practicingEntry.imageAlt,
            ...(practicingEntry.audioId
              ? {
                  audio: {
                    id: practicingEntry.audioId,
                    entry: practicingEntry.audio,
                    status: practicingEntry.audioStatus,
                  },
                }
              : {}),
          }}
        />}
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["All", "Listening", "Reading", "Writing", "Speaking"] as Skill[]).map((s) => (
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
        <div className="space-y-6">
          {filteredEntries.map((entry) => (
            <section key={entry.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
                <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${entry.skill === "Listening" ? "bg-violet-50 text-violet-600" : "bg-blue-50 text-blue-600"}`}>
                    {entry.skill}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">{entry.part}</span>
                </div>
                <h2 className="mt-2 font-display text-xl font-bold text-zinc-900">{entry.title}</h2>
                </div>
                {entry.href ? (
                  <button type="button" onClick={() => setPracticingSetId(entry.id)} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"><Icon name="play" size={14} /> View prompt</button>
                ) : (
                  <button type="button" onClick={() => setPracticingSetId(entry.id)} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"><Icon name="play" size={14} /> Practice this set</button>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {/* Practice CTA */}
    </div>
  );
}

