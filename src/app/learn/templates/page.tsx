import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Icon } from "@/components/icons";
import { PracticeHero } from "@/components/practice/PracticeHero";
import { TemplatesBrowser } from "@/components/practice/TemplatesBrowser";
import { Container } from "@/components/ui/Container";
import { templates } from "@/data/content";

export const metadata: Metadata = {
  title: "CELPIP Writing & Speaking Templates | Linguaband",
  description:
    "Browse CELPIP Speaking and Writing templates with practical structures, useful phrases, and task-specific guidance.",
};

export default function TemplatesPage() {
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
            <TemplatesBrowser templates={templates} />

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
