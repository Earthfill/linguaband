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

      {track.imageUrl ? (
        <figure className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {/* Native img is intentional: track images are served by the app's R2 proxy. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={track.imageUrl} alt={track.imageAlt || `Visual for ${track.title}`} className="mx-auto max-h-[32rem] w-full object-contain" />
          {track.imageAlt ? <figcaption className="border-t border-zinc-100 px-4 py-2 text-center text-xs text-zinc-500">{track.imageAlt}</figcaption> : null}
        </figure>
      ) : null}

      <DialogueAudioPlayer key={track.id} transcript={track.transcript} mode="practice" entry={track.audio} source="practice" />

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <McqPractice questions={track.questions} accent="violet" />
      </div>
    </div>
  );
}
