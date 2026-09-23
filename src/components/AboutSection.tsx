import Link from "next/link";
import { Icon } from "@/components/icons";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const checklist = [
  "4,000+ questions and 60+ full-length timed mocks",
  "Sample answers for every CLB level from 4 to 12",
  "Instant AI scoring plus explanations on every item",
  "Native iOS & Android apps with synced progress",
  "7-day refund policy — no conditions attached",
];

export function AboutSection() {
  return (
    <section id="about" className="bg-zinc-100/60 py-16 sm:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                About Linguaband
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
                Prep the way you&apos;ll actually take the test
              </h2>
              <p className="mt-5 text-base leading-7 text-zinc-500 sm:text-lg">
                CELPIP rewards familiar hands. Linguaband gives you the full exam
                experience online — same layout, same timing, same pressure —
                whether your goal is Canadian immigration, citizenship,
                professional licensing, or an Australian visa (DHA-accepted).
                That&apos;s your fastest route to a top score.
              </p>
              <ul className="mt-6 space-y-3">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] leading-6 text-zinc-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <Icon name="check" size={12} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/questions"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-7 text-[15px] font-semibold text-white shadow-lg shadow-zinc-900/15 transition-colors hover:bg-zinc-800"
                >
                  Start My Free Practice
                </Link>
                <Link
                  href="/learn"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-7 text-[15px] font-semibold text-zinc-900 transition-colors hover:border-zinc-400"
                >
                  Browse study materials
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: "clipboard" as const, count: "60+", label: "Full mock tests", tone: "bg-blue-50 text-blue-600" },
                { icon: "quiz" as const, count: "4,000+", label: "Practice questions", tone: "bg-violet-50 text-violet-600" },
                { icon: "sparkles" as const, count: "Instant", label: "AI scoring & feedback", tone: "bg-teal-50 text-teal-600" },
                { icon: "bar-chart" as const, count: "CLB 4–12", label: "Sample answers", tone: "bg-amber-50 text-amber-600" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${card.tone}`}>
                    <Icon name={card.icon} size={22} />
                  </span>
                  <p className="mt-4 font-display text-2xl font-bold text-zinc-900">
                    {card.count}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">{card.label}</p>
                </div>
              ))}
              <div className="flex flex-col justify-center rounded-2xl bg-zinc-900 p-6 text-white shadow-lg sm:col-span-2">
                <p className="font-display text-xl font-bold">
                  The short way to a{" "}
                  <span className="text-blue-300">10+ CELPIP score.</span>
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Thousands of questions, full timed mocks, and AI scoring on
                  everything you submit.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
