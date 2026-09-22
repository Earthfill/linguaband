import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { PracticeHero } from "@/components/practice/PracticeHero";
import { ExamBrowser } from "@/components/practice/ExamBrowser";
import { listMocks } from "@/lib/store";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

const facts = [
  { icon: "clock" as const, label: "Official timing", value: "Full exam ~2h 50m" },
  { icon: "layers" as const, label: "Four skills", value: "L · R · W · S" },
  { icon: "bar-chart" as const, label: "CLB estimate", value: "Levels 3–12" },
];

export default async function ExamsPage() {
  const mocks = await listMocks();
  return (
    <>
      <Header />
      <main className="flex-1">
        <PracticeHero
          eyebrow="Practice · Mock Exams"
          title="Full-length exams that feel like the real thing"
          description="Same section order, same clock, same pressure. Pick a mock, sit through it in one sitting, and get a score breakdown the moment you submit."
          crumbs={[{ label: "Home", href: "/" }, { label: "Mock Exams", href: "/exams" }]}
        />

        <section className="py-12 sm:py-16">
          <Container>
            <div className="mb-8 grid gap-3 sm:grid-cols-3">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon name={fact.icon} size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-zinc-900">
                      {fact.value}
                    </span>
                    <span className="block text-xs text-zinc-500">{fact.label}</span>
                  </span>
                </div>
              ))}
            </div>

            <h2 className="mb-6 font-display text-2xl font-bold text-zinc-900">
              Available mock exams
            </h2>
            <ExamBrowser mocks={mocks} />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
