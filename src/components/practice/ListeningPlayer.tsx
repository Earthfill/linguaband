"use client";

import type { ListeningTrack } from "@/data/practice";
import { DialogueAudioPlayer } from "@/components/practice/DialogueAudioPlayer";
import { McqPractice } from "@/components/practice/McqPractice";

export function ListeningPlayer({ track }: { track: ListeningTrack }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">{track.part}</p>
          <h3 className="mt-0.5 font-display text-lg font-bold text-zinc-900">{track.title}</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {track.setting} · {track.speaker}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-500">
          {track.trackLabel}
        </span>
      </div>

      <DialogueAudioPlayer key={track.id} id={track.id} transcript={track.transcript} mode="practice" />

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <McqPractice questions={track.questions} accent="violet" />
      </div>
    </div>
  );
}
