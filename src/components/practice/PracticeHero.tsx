import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { Container } from "@/components/ui/Container";

type PracticeHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  accent?: string; // soft color tint for the badge icon
  icon?: ReactNode;
  crumbs?: { label: string; href: string }[];
};

export function PracticeHero({
  eyebrow,
  title,
  description,
  accent = "bg-blue-50 text-blue-600",
  icon,
  crumbs,
}: PracticeHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 bg-zinc-50 pb-10 pt-10 sm:pb-14 sm:pt-14">
      <div className="pointer-events-none absolute inset-x-0 -top-32 -z-10 mx-auto h-72 max-w-3xl rounded-full bg-gradient-to-b from-blue-100/70 to-transparent blur-3xl" />
      <Container>
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
          {crumbs?.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-1.5">
              {i > 0 ? <Icon name="chevron-down" size={12} className="-rotate-90" /> : null}
              <Link href={crumb.href} className="transition-colors hover:text-zinc-900">
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>

        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <Icon name="target" size={12} className={accent.split(" ")[1]} />
            {eyebrow}
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-500 sm:text-lg">{description}</p>
          {icon ? <div className="mt-6">{icon}</div> : null}
        </div>
      </Container>
    </section>
  );
}
