import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PracticeHero } from "@/components/practice/PracticeHero";
import { Container } from "@/components/ui/Container";
import { templates } from "@/data/content";
import { speakingTasks, writingTasks } from "@/data/practice";

type TemplateDetail = {
  href: string;
  taskId: string;
};

const templateDetails: TemplateDetail[] = [
  {
    href: "/learn/speaking-task-1",
    taskId: "spk-01",
  },
  {
    href: "/learn/speaking-task-2",
    taskId: "spk-02",
  },
  {
    href: "/learn/speaking-task-3",
    taskId: "spk-03",
  },
  {
    href: "/learn/speaking-task-4",
    taskId: "spk-04",
  },
  {
    href: "/learn/speaking-task-5",
    taskId: "spk-05",
  },
  {
    href: "/learn/speaking-task-6",
    taskId: "spk-06",
  },
  {
    href: "/learn/speaking-task-7",
    taskId: "spk-07",
  },
  {
    href: "/learn/speaking-task-8",
    taskId: "spk-08",
  },
  {
    href: "/learn/celpip-writing-task-1",
    taskId: "wr-01",
  },
  {
    href: "/learn/celpip-writing-task-2",
    taskId: "wr-02",
  },
];

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return templateDetails.map(({ href }) => ({
    slug: href.split("/").at(-1)!,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = `/learn/${slug}`;
  const template = templates.find(({ href }) => href === path);

  return {
    title: template ? `${template.title} | Linguaband` : "Template not found | Linguaband",
    description: template?.description ?? "CELPIP Writing and Speaking template guide.",
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const path = `/learn/${slug}`;
  const template = templates.find(({ href }) => href === path);
  const detail = templateDetails.find(({ href }) => href === path);

  if (!template || !detail) notFound();

  const writingTask = writingTasks.find(({ id }) => id === detail.taskId);
  const speakingTask = speakingTasks.find(({ id }) => id === detail.taskId);
  const task = writingTask ?? speakingTask;

  if (!task) notFound();

  const tips = writingTask ? writingTask.instructions : speakingTask!.tips;

  return (
    <>
      <Header />
      <main className="flex-1">
        <PracticeHero
          eyebrow={`${template.group} template · ${template.level}`}
          title={template.title}
          description={template.description}
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Templates", href: "/learn/templates" },
            { label: template.title, href: path },
          ]}
        />

        <section className="py-12 sm:py-16">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
              <div className="space-y-8">
                <section className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
                  <h2 className="font-display text-xl font-bold text-zinc-900">The sample question</h2>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-600">
                    {task.scenario}
                  </p>
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
                  <h2 className="font-display text-xl font-bold text-zinc-900">
                    A structure to follow
                  </h2>
                  <ol className="mt-5 space-y-4">
                    {tips.map((tip, index) => (
                      <li key={tip} className="flex gap-3 text-sm leading-6 text-zinc-600">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                          {index + 1}
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="rounded-2xl bg-zinc-900 p-6 text-white sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                    {writingTask ? "Sample response" : speakingTask!.clb}
                  </p>
                  <h2 className="mt-3 font-display text-xl font-bold">
                    Learn from an example
                  </h2>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-300">
                    {task.sampleAnswer}
                  </p>
                </section>

                {writingTask ? (
                  <section className="rounded-2xl border border-zinc-200 bg-white p-6">
                    <h2 className="font-display text-lg font-bold text-zinc-900">
                      What to focus on
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {writingTask.criteria.map((criterion) => (
                        <li key={criterion.label}>
                          <p className="text-sm font-semibold text-zinc-800">
                            {criterion.label}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-zinc-500">
                            {criterion.note}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 border-t border-zinc-100 pt-4 text-xs font-medium text-zinc-400">
                      Target length: {writingTask.wordTarget} · Suggested time: {writingTask.timeLimit}
                    </p>
                  </section>
                ) : null}
              </aside>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={writingTask ? "/writing" : "/speaking"}
                className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                Practice {template.group.toLowerCase()}
              </Link>
              <Link
                href="/learn/templates"
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Browse all templates
              </Link>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}