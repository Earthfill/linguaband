"use client";

import { stats } from "@/data/content";
import { CountUp } from "@/components/ui/CountUp";
import { Container } from "@/components/ui/Container";

export function StatsBar() {
  return (
    <section className="border-y border-zinc-200 bg-white">
      <Container>
        <div className="grid grid-cols-2 divide-zinc-100 py-8 sm:py-10 lg:grid-cols-4 lg:divide-x">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 px-4 py-2 text-center"
            >
              <span className="font-display text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                <CountUp
                  value={stat.value}
                  decimals={stat.decimals}
                  suffix={stat.suffix}
                />
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 sm:text-[13px]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
