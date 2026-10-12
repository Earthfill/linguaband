const BADGE_TONES: Record<string, string> = {
  content: "text-zinc-600 bg-zinc-100",
  generating: "text-amber-700 bg-amber-50",
  ready: "text-emerald-700 bg-emerald-50",
  failed: "text-rose-700 bg-rose-50",
  stuck: "text-orange-700 bg-orange-50",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        BADGE_TONES[status] ?? "text-zinc-600 bg-zinc-100"
      }`}
    >
      {status === "generating" ? (
        <span className="h-2 w-2 shrink-0 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" aria-hidden="true" />
      ) : null}
      {status}
    </span>
  );
}
