import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { PracticeHero } from "@/components/practice/PracticeHero";
import { SpeakingBrowser } from "@/components/practice/SpeakingBrowser";

const format = [
  "30s prep + 60s speaking",
  "8 task types",
  "Sample responses for every CLB",
];

export default function SpeakingPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PracticeHero
          eyebrow="Practice · Speaking"
          title="Rehearse every speaking task under real timing"
          description="Run the prep timer, speak against the clock, then compare your answer with a CLB-graded sample response."
          crumbs={[{ label: "Home", href: "/" }, { label: "Speaking", href: "/speaking" }]}
        />

        <section className="py-12 sm:py-16">
          <Container>
            <div className="mb-8 flex flex-wrap gap-2">
              {format.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-zinc-600"
                >
                  {item}
                </span>
              ))}
            </div>
            <SpeakingBrowser />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
