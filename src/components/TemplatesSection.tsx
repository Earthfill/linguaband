import Link from "next/link";
import { templates } from "@/data/content";
import { Icon } from "@/components/icons";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const groupStyle: Record<string, string> = {
  Speaking: "bg-violet-50 text-violet-600",
  Writing: "bg-blue-50 text-blue-600",
};

export function TemplatesSection() {
  return (
    <section id="templates" className="bg-zinc-100/60 py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Writing & Speaking Templates"
            title="Copy-ready blueprints for every task"
            subtitle="Sentence-by-sentence frameworks for each CELPIP Writing and Speaking prompt — the same patterns our highest-scoring students use."
          />
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, i) => (
            <Reveal key={template.title} delay={i * 70}>
              <Link
                href={template.href}
                className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center gap-2">
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
                      groupStyle[template.group] ?? "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    <Icon name={template.icon} size={18} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {template.group}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold leading-snug text-zinc-900 transition-colors group-hover:text-blue-600">
                  {template.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-zinc-500">
                  {template.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="ml-auto text-[11px] font-semibold text-zinc-400">
                    {template.level}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}

          {/* CTA card to complete the grid */}
          <Reveal delay={templates.length * 70}>
            <Link
              href="/learn/templates"
              className="group flex h-full flex-col items-start justify-between rounded-2xl bg-zinc-900 p-6 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-800"
            >
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-200">
                  <Icon name="bulb" size={13} />
                  Free templates
                </span>
                <h3 className="mt-4 font-display text-xl font-bold leading-snug">
                  Get every template <br />
                  in one place
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Grab the complete Writing & Speaking template library, with
                  graded sample answers for CLB 4 through 12.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
                Open template library
                <Icon
                  name="arrow-right"
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
