import { Icon } from "@/components/icons";

const navItems = [
  { label: "Listening", active: true },
  { label: "Reading", active: false },
  { label: "Writing", active: false },
  { label: "Speaking", active: false },
  { label: "Mock Tests", active: false },
];

const options = [
  { id: "A", text: "Check the return policy and send a follow-up email." },
  { id: "B", text: "Call the customer to confirm the order details." },
  { id: "C", text: "Offer an in-store credit for the next purchase.", selected: true },
  { id: "D", text: "Wait a week to see if the item gets delivered." },
];

/**
 * Pure-CSS recreation of the Shilu practice dashboard mockup
 * shown in the hero section.
 */
export function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-3xl">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute -inset-6 -z-10">
        <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-10 -right-6 h-48 w-48 rounded-full bg-violet-200/50 blur-3xl" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/10">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>
          <div className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-white px-4 py-1 text-xs text-zinc-400 shadow-sm ring-1 ring-zinc-100">
            <Icon name="shield" size={12} className="text-emerald-500" />
            shilu.ai/practice/listening
          </div>
        </div>

        {/* App frame */}
        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden w-44 shrink-0 flex-col gap-1 border-r border-zinc-100 bg-zinc-50/50 p-3 sm:flex">
            <div className="mb-2 flex items-center gap-2 px-2">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-blue-600 text-white">
                <Icon name="mic" size={13} />
              </span>
              <span className="text-xs font-bold text-zinc-900">Shilu</span>
            </div>
            {navItems.map((item) => (
              <span
                key={item.label}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  item.active ? "bg-blue-50 text-blue-600" : "text-zinc-500"
                }`}
              >
                <Icon
                  name={
                    item.label === "Listening"
                      ? "headphones"
                      : item.label === "Reading"
                        ? "book"
                        : item.label === "Writing"
                          ? "pen"
                          : item.label === "Speaking"
                            ? "user"
                            : "clipboard-list"
                  }
                  size={14}
                />
                {item.label}
              </span>
            ))}
            <div className="mt-auto rounded-xl border border-dashed border-zinc-200 p-2.5 text-[11px] leading-snug text-zinc-400">
              4,000+ questions
              <br /> available
            </div>
          </aside>

          {/* Main question area */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Part 1 · Listening — Problem Solving
                </p>
                <p className="mt-0.5 text-sm font-semibold text-zinc-900">
                  Question 3 of 6
                </p>
              </div>
            </div>

            {/* Audio player */}
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-600 text-white">
                <Icon name="play" size={14} />
              </span>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Audio clip · Track 1</span>
                  <span>0:23 / 0:47</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-200">
                  <div className="h-1.5 w-1/2 rounded-full bg-blue-600" />
                </div>
              </div>
            </div>

            <p className="mb-3 text-[13px] leading-snug text-zinc-700">
              The customer calls about a delayed delivery. What should the
              representative do first?
            </p>

            <div className="space-y-1.5">
              {options.map((opt) => (
                <div
                  key={opt.id}
                  className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-[12px] leading-snug transition-colors ${
                    opt.selected ? "border-blue-200 bg-blue-50" : "border-zinc-100"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[9px] font-bold ${
                      opt.selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-zinc-300 text-zinc-500"
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className={opt.selected ? "text-blue-700" : "text-zinc-600"}>
                    {opt.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                ✓ Answered 2 · Minimum score CLB 8
              </span>
              <span className="rounded-full bg-zinc-900 px-4 py-1.5 text-[11px] font-semibold text-white">
                Next
              </span>
            </div>
          </div>

          {/* AI score panel */}
          <aside className="hidden w-40 shrink-0 flex-col gap-3 border-l border-zinc-100 bg-white p-3 md:flex">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              AI Score
            </p>
            <div className="grid place-items-center">
              <div className="relative grid h-20 w-20 place-items-center">
                <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#f4f4f5" strokeWidth="7" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray="213.6"
                    strokeDashoffset="42.7"
                  />
                </svg>
                <span className="absolute font-display text-lg font-bold text-zinc-900">
                  88
                </span>
              </div>
            </div>
            <div>
              {[
                { label: "Vocabulary", pct: 80 },
                { label: "Grammar", pct: 90 },
                { label: "Cohesion", pct: 58 },
              ].map((row) => (
                <div key={row.label} className="mb-2">
                  <div className="mb-0.5 flex justify-between text-[10px] text-zinc-400">
                    <span>{row.label}</span>
                    <span>{row.pct}%</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-zinc-100">
                    <div
                      className="h-1 rounded-full bg-blue-600"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-auto rounded-lg bg-emerald-50 p-2 text-[10px] leading-snug text-emerald-700">
              Great job! Try rephrasing the closing for a higher cohesion score.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
