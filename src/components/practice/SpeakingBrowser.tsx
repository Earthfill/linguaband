"use client";

import { useState } from "react";
import { speakingTasks, speakingOverview } from "@/data/practice";
import { Icon } from "@/components/icons";
import { SpeakingStudio } from "@/components/practice/SpeakingStudio";

type OverviewItem = (typeof speakingOverview)[number];

export function SpeakingBrowser() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = speakingTasks.find((t) => t.id === activeId);
  const detailedTitles = new Set(speakingTasks.map((t) => t.title));

  if (active) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setActiveId(null)}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400"
        >
          <Icon name="arrow-right" size={14} className="rotate-180" />
          All speaking tasks
        </button>
        <SpeakingStudio task={active} />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {speakingOverview.map((item: OverviewItem, i) => {
        const playable = detailedTitles.has(item.title);
        return (
          <button
            key={item.title}
            type="button"
            disabled={!playable}
            onClick={() =>
              setActiveId(speakingTasks.find((t) => t.title === item.title)?.id ?? null)
            }
            className={`group flex h-full flex-col items-start rounded-2xl border bg-white p-6 text-left shadow-sm transition-all duration-300 ${
              playable
                ? "border-zinc-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
                : "cursor-default border-zinc-200"
            }`}
          >
            <div className="flex w-full items-start justify-between gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Icon name={item.icon as never} size={22} />
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                {i + 1}
              </span>
            </div>
            <h3 className="mt-4 font-display text-base font-bold leading-snug text-zinc-900 group-hover:text-violet-600">
              {item.title}
            </h3>
            <p className="mt-1.5 flex-1 text-sm leading-6 text-zinc-500">{item.desc}</p>
            {playable ? (
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-600">
                Try sample
                <Icon
                  name="arrow-right"
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            ) : (
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-400">
                <Icon name="list" size={14} />
                Full task library
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
