import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { PracticeHero } from "@/components/practice/PracticeHero";
import { WritingBrowser } from "@/components/practice/WritingBrowser";

const skills = [
  "150–200 word email",
  "Survey response structure",
  "Formal vs informal register",
];

export default function WritingPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PracticeHero
          eyebrow="Practice · Writing"
          title="Write both CELPIP tasks with live feedback"
          description="Draft your email or survey answer and run a scoring preview that checks length, linking words, and paragraph structure against the word target."
          crumbs={[{ label: "Home", href: "/" }, { label: "Writing", href: "/writing" }]}
        />

        <section className="py-12 sm:py-16">
          <Container>
            <div className="mb-8 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-zinc-600"
                >
                  {skill}
                </span>
              ))}
            </div>
            <WritingBrowser />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
