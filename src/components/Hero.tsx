import Link from "next/link";
import { skillPills } from "@/data/content";
import { IconStar } from "@/components/icons";
import { DashboardMockup } from "@/components/ui/DashboardMockup";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-24">
      {/* Top glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-105 max-w-4xl rounded-full bg-linear-to-b from-blue-100/80 via-blue-50/40 to-transparent blur-3xl" />

      <Container>
        <div className="flex flex-col items-center text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-600 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
              </span>
              60+ timed mock tests · 4,000+ questions · AI feedback
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
              The fastest way to hit{" "}
              <span className="relative whitespace-nowrap text-blue-600">
                10+
                <svg
                  viewBox="0 0 120 12"
                  className="absolute -bottom-2 left-0 w-full text-blue-300"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 9C25 3 60 2 117 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              on CELPIP
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg">
              Train on{" "}
              <span className="font-semibold text-zinc-700">
                4,000+ exam-style questions
              </span>{" "}
              and{" "}
              <span className="font-semibold text-zinc-700">
                60+ timed mock tests
              </span>
              . Every answer gets instant AI scoring and feedback the moment you submit.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/questions"
                className="group inline-flex h-13 items-center gap-2 rounded-full bg-zinc-900 px-7 text-[15px] font-semibold text-white shadow-lg shadow-zinc-900/15 transition-all hover:bg-zinc-800 hover:shadow-xl"
              >
                Start My Free Practice
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-13 items-center rounded-full border border-zinc-300 bg-white px-7 text-[15px] font-semibold text-zinc-900 transition-colors hover:border-zinc-400"
              >
                View Pricing
              </Link>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-7 flex items-center justify-center gap-2.5">
              <div className="flex items-center gap-0.5 text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} className="h-4 w-4" />
                ))}
              </div>
              <p className="text-sm text-zinc-600">
                <span className="font-semibold text-zinc-900">4.9</span> — rated
                by{" "}
                <span className="font-semibold text-zinc-900">140K+</span>{" "}
                CELPIP candidates
              </p>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              {skillPills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-[13px] font-medium text-zinc-700 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600"
                >
                  {pill}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <div className="mt-14 sm:mt-16">
            <DashboardMockup />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
