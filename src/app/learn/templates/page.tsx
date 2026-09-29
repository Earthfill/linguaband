import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Icon } from "@/components/icons";
import { PracticeHero } from "@/components/practice/PracticeHero";
import { Container } from "@/components/ui/Container";
import { templates } from "@/data/content";

export const metadata: Metadata = {
  title: "CELPIP Writing & Speaking Templates | Linguaband",
  description:
    "Browse CELPIP Speaking and Writing templates with practical structures, useful phrases, and task-specific guidance.",
};

const groupStyle: Record<string, string> = {
  Speaking: "bg-violet-50 text-violet-600",
  Writing: "bg-blue-50 text-blue-600",
};

export default function TemplatesPage() {
  const speakingTemplates = templates.filter((template) => template.group === "Speaking");
  const writingTemplates = templates.filter((template) => template.group === "Writing");

  return (
    <>
      <Header />
      <main className="flex-1">
        <PracticeHero
          eyebrow="Free study resources"
          title="CELPIP Writing & Speaking templates"
          description="Explore clear, reusable frameworks for common CELPIP tasks. Use each structure as a starting point, then adapt the details and language to the prompt."
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Templates", href: "/learn/templates" },
          ]}
        />

        <section className="py-12 sm:py-16">
          <Container>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900">Template library</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {speakingTemplates.length} Speaking and {writingTemplates.length} Writing frameworks
                </p>
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Template categories">
                {["Speaking", "Writing"].map((group) => (
                  <span
                    key={group}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${groupStyle[group]}`}
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>

            <section aria-labelledby="speaking-templates-heading" className="mb-12">
              <div className="mb-6">
                <h2 id="speaking-templates-heading" className="font-display text-2xl font-bold text-zinc-900">
                  Speaking templates
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Explore a practical guide for each of the eight CELPIP Speaking tasks.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {speakingTemplates.map((template) => (
                  <article
                    key={template.title}
                    className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
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
                    <h3 className="font-display text-lg font-bold leading-snug text-zinc-900">
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
                    <Link
                      href={template.href}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                    >
                      Explore template
                      <Icon name="arrow-right" size={15} />
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="writing-templates-heading">
              <div className="mb-6">
                <h2 id="writing-templates-heading" className="font-display text-2xl font-bold text-zinc-900">
                  Writing templates
                </h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {writingTemplates.map((template) => (
                  <article
                    key={template.title}
                    className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
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
                    <h3 className="font-display text-lg font-bold leading-snug text-zinc-900">
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
                    <Link
                      href={template.href}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                    >
                      Explore template
                      <Icon name="arrow-right" size={15} />
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            <div className="mt-12 rounded-2xl bg-zinc-50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
              <div>
                <h2 className="font-display text-xl font-bold text-zinc-900">
                  Make the framework your own
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                  Templates work best when you adapt them to the question. Practice your
                  response and build confidence with task-focused exercises.
                </p>
              </div>
              <Link
                href="/writing"
                className="mt-5 inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 sm:mt-0"
              >
                Start writing practice
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}