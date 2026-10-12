"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/icons";

export default function WritingError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-4 py-16 text-center sm:py-24">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
        <Icon name="quiz" size={24} />
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
        A writing task is required
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
        {error.message ||
          "Open this page with a task selected, e.g. /writing?taskId=wr-01, so we know which prompt to load."}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          <Icon name="refresh" size={16} />
          Try again
        </button>
        <Link
          href="/learn/templates"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Browse templates
          <Icon name="arrow-right" size={16} />
        </Link>
      </div>
    </div>
  );
}
