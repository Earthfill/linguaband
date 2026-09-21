"use client";

import { useState } from "react";
import { listeningTracks } from "@/data/practice";
import { Icon } from "@/components/icons";
import { ListeningPlayer } from "@/components/practice/ListeningPlayer";

export function ListeningBrowser() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = listeningTracks.find((t) => t.id === activeId);

  if (active) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setActiveId(null)}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400"
        >
          <Icon name="arrow-right" size={14} className="rotate-180" />
          All listening tracks
        </button>
        <ListeningPlayer track={active} />
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {listeningTracks.map((track) => (
        <button
          key={track.id}
          type="button"
          onClick={() => setActiveId(track.id)}
          className="group flex h-full flex-col items-start rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
        >
          <div className="flex w-full items-start justify-between gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Icon name="headphones" size={22} />
            </span>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-500">
              {track.part}
            </span>
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-zinc-900 group-hover:text-violet-600">
            {track.title}
          </h3>
          <p className="mt-1.5 text-sm leading-6 text-zinc-500">
            {track.setting} · {track.speaker}
          </p>
          <div className="mt-4 flex w-full items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">
              {track.questions.length} questions · {track.trackLabel}
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-900 text-white transition-transform group-hover:scale-110">
              <Icon name="play" size={13} />
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
