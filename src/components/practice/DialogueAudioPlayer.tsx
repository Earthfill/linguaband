"use client";

import { useMemo, useRef, useState } from "react";
import { audioManifest } from "@/data/practice/audio-manifest";
import type { AudioEntry } from "@/data/practice/audio-manifest";
import { Icon } from "@/components/icons";

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function parseLines(transcript: string): { speaker: string; text: string }[] {
  const lines: { speaker: string; text: string }[] = [];
  for (const line of transcript.split("\n")) {
    const match = line.match(/^([A-Z][A-Z ]*?):\s*(.*)$/);
    if (match) lines.push({ speaker: match[1].trim(), text: match[2].trim() });
  }
  return lines;
}

function indexOfNormalized(haystack: string, needle: string, from = 0): number {
  const pattern = needle
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s+");
  const match = haystack.slice(from).match(new RegExp(pattern));
  return match ? from + (match.index ?? 0) : -1;
}

function splitIntoSpans(
  full: string,
  sentenceTexts: string[],
): { text: string; sentenceIndex: number }[] | null {
  const spans: { text: string; sentenceIndex: number }[] = [];
  let cursor = 0;
  for (let i = 0; i < sentenceTexts.length; i += 1) {
    const idx = indexOfNormalized(full, sentenceTexts[i], cursor);
    if (idx < 0) return null;
    if (idx > cursor) spans.push({ text: full.slice(cursor, idx), sentenceIndex: -1 });
    spans.push({ text: full.slice(idx, idx + sentenceTexts[i].length), sentenceIndex: i });
    cursor = idx + sentenceTexts[i].length;
  }
  if (cursor < full.length) spans.push({ text: full.slice(cursor), sentenceIndex: -1 });
  return spans;
}

/**
 * Human-sounding listening audio (neural TTS, one voice per speaker).
 * `exam` mode plays once and locks the transcript until the audio ends;
 * `practice` mode allows replay and a transcript toggle.
 */
export function DialogueAudioPlayer({
  id,
  transcript,
  mode,
  onEnded,
  entry: propEntry,
  source,
}: {
  id: string;
  transcript: string;
  mode: "exam" | "practice";
  onEnded?: () => void;
  entry?: AudioEntry;
  source?: "stored" | "builtin";
}) {
  const entry = propEntry ?? audioManifest[id];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [time, setTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  const lines = useMemo(() => parseLines(transcript), [transcript]);

  if (!entry) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <Icon name="headphones" size={14} /> Listening script
        </p>
        <p className="mt-3 whitespace-pre-line text-[15px] leading-8 text-zinc-700">{transcript}</p>
        <p className="mt-3 text-xs text-zinc-400">
          {source === "stored" ? (
              "Audio is still being generated. If it does not appear, the audio job was not scheduled — check the GitHub token permission."
            ) : (
              <>Audio not generated yet — run <code className="rounded bg-zinc-100 px-1">npm run audio:bundled</code>.</>
            )}
        </p>
      </div>
    );
  }

  const allowReplay = mode === "practice";
  const revealTranscript = allowReplay ? showTranscript : ended;
  const currentIndex = entry.segments.findIndex(
    (seg) => time >= seg.start && time < seg.start + seg.duration,
  );
  const activeSeg = currentIndex >= 0 ? entry.segments[currentIndex] : null;
  const currentSpeaker = activeSeg ? activeSeg.speaker : null;
  const localTime = activeSeg ? time - activeSeg.start : 0;
  const sentenceIndex =
    activeSeg && activeSeg.sentences.length > 0
      ? activeSeg.sentences.findIndex(
          (s) => localTime >= s.start && localTime < s.start + s.duration,
        )
      : -1;
  const progress = entry.durationSec > 0 ? Math.min(1, time / entry.durationSec) : 0;

  function play() {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    setEnded(false);
    void el.play();
  }

  function toggle() {
    if (playing) audioRef.current?.pause();
    else play();
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <audio
        ref={audioRef}
        src={entry.src}
        preload="metadata"
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setEnded(true);
          onEnded?.();
        }}
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          disabled={ended && !allowReplay}
          aria-label={playing ? "Pause audio" : "Play audio"}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name={playing ? "pause" : "play"} size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate font-semibold text-zinc-900">
                {currentSpeaker && playing ? "Now speaking:" : "Listening audio"}
              </span>
              {currentSpeaker ? (
                <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">
                  {currentSpeaker}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-xs font-semibold text-zinc-400">
              {fmt(time)} / {fmt(entry.durationSec)}
            </span>
          </div>
          <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-2 rounded-full bg-blue-600 transition-[width] duration-150"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Icon name="headphones" size={13} />
              {mode === "exam" ? "Plays once — like the real test" : "Practice mode"}
            </span>
            {allowReplay && ended ? (
              <button
                type="button"
                onClick={play}
                className="inline-flex items-center gap-1.5 font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                <Icon name="refresh" size={13} /> Replay
              </button>
            ) : null}
            {!allowReplay && ended ? (
              <span className="font-semibold text-emerald-600">Audio finished</span>
            ) : null}
          </div>
        </div>
      </div>

      {!allowReplay && !ended ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          The transcript unlocks after the audio finishes, matching the real test.
        </p>
      ) : null}

      {allowReplay ? (
        <button
          type="button"
          onClick={() => setShowTranscript((v) => !v)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
        >
          {showTranscript ? "Hide" : "Show"} transcript
          <Icon name="chevron-down" size={14} className={`transition-transform ${showTranscript ? "rotate-180" : ""}`} />
        </button>
      ) : null}

      {revealTranscript ? (
        <div className="mt-4 space-y-2 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4">
          {lines.map((line, i) => {
            const active = i === currentIndex;
            const spans =
              active && activeSeg && activeSeg.sentences.length > 0
                ? splitIntoSpans(line.text, activeSeg.sentences.map((s) => s.text))
                : null;
            return (
              <div key={i} className={`rounded-lg px-3 py-2 ${active ? "bg-blue-100/70" : ""}`}>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">{line.speaker}</span>
                <p className="text-sm leading-6 text-zinc-700">
                  {spans
                    ? spans.map((span, j) => (
                        <span
                          key={j}
                          className={
                            span.sentenceIndex === sentenceIndex
                              ? "rounded bg-amber-200/90 px-0.5"
                              : undefined
                          }
                        >
                          {span.text}
                        </span>
                      ))
                    : line.text}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

