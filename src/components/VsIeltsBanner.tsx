import Link from "next/link";
import { Icon } from "@/components/icons";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function VsIeltsBanner() {
  return (
    <section id="celpip-vs-ielts" className="pb-16 sm:pb-24">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 px-6 py-12 text-center shadow-xl shadow-blue-600/20 sm:px-12 sm:py-16">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute right-10 top-6 h-3 w-3 rounded-full bg-white/30" />
            <div className="pointer-events-none absolute left-1/3 top-10 h-2 w-2 rounded-full bg-white/20" />

            <span className="relative inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100">
              <Icon name="globe" size={13} />
              CELPIP vs IELTS
            </span>

            <h2 className="relative mx-auto mt-5 max-w-2xl font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              Not sure which test fits your goals?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-[15px] leading-7 text-blue-100">
              Stack up CELPIP and IELTS on format, fees, scoring, and result
              turnaround — then choose the path that moves your application
              forward.
            </p>

            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/lp/celpip-vs-ielts"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-[15px] font-semibold text-blue-700 shadow-lg transition-transform hover:scale-[1.03]"
              >
                Read full comparison
                <Icon name="arrow-right" size={16} />
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                Browse CELPIP study guides
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
