import Link from "next/link";
import { features } from "@/data/content";
import { Icon } from "@/components/icons";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function FeatureCards() {
  return (
    <section id="features" className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Everything you need"
            title="Everything you need to crack the real test"
            subtitle="The three pillars of efficient prep: realistic mock exams, instant AI scoring, and answer walkthroughs that actually teach."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 90}>
              <Link
                href={feature.href}
                className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-600/5"
              >
                <span
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.accent}`}
                >
                  <Icon name={feature.icon} size={22} />
                </span>
                <h3 className="font-display text-xl font-bold text-zinc-900">
                  {feature.title}
                </h3>
                <p className="mt-1 font-medium text-blue-600">{feature.tagline}</p>
                <p className="mt-3 flex-1 text-[15px] leading-7 text-zinc-500">
                  {feature.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-blue-600">
                  {feature.cta}
                  <Icon
                    name="arrow-right"
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
