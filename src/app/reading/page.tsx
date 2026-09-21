import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { PracticeHero } from "@/components/practice/PracticeHero";
import { ReadingBrowser } from "@/components/practice/ReadingBrowser";

const parts = [
  "Correspondence",
  "Apply a Diagram",
  "Information",
  "Viewpoints",
];

export default function ReadingPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PracticeHero
          eyebrow="Practice · Reading"
          title="Read fast, scan smarter, answer correctly"
          description="Work through passages side by side with their questions, with time-based targets and explanations that reveal the best skimming strategies."
          crumbs={[{ label: "Home", href: "/" }, { label: "Reading", href: "/reading" }]}
        />

        <section className="py-12 sm:py-16">
          <Container>
            <div className="mb-8 flex flex-wrap gap-2">
              {parts.map((part) => (
                <span
                  key={part}
                  className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-zinc-600"
                >
                  {part}
                </span>
              ))}
            </div>
            <ReadingBrowser />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
