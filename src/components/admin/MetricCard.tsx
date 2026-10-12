export function MetricCard({ label, value, detail, tone }: { label: string; value: number; detail: string; tone: "blue" | "violet" | "green" | "amber" }) {
  const tones = { blue: "bg-blue-50 text-blue-700", violet: "bg-violet-50 text-violet-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700" };
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-500">{label}</p>
        <span className={"rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide " + tones[tone]}>Live</span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-zinc-900">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}
