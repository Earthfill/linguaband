import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { PracticeHero } from "@/components/practice/PracticeHero";
import { QuestionBank } from "@/components/practice/QuestionBank";
import { buildQuestionBank } from "@/data/practice";
import { listPracticeSets } from "@/lib/store";

export default async function QuestionsPage() {
  const sets = await listPracticeSets();
  const questions = buildQuestionBank(sets.listening, sets.reading);
  return (
    <>
      <Header />
      <main className="flex-1">
        <PracticeHero
          eyebrow="Practice · Question Bank"
          title="Browse and drill thousands of exam-style questions"
          description="Filter by skill, search by keyword, and practice any set with instant checking and a full explanation on every answer."
          crumbs={[{ label: "Home", href: "/" }, { label: "Question Bank", href: "/questions" }]}
        />

        <section className="py-12 sm:py-16">
          <Container>
            <QuestionBank questions={questions} sets={sets} />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
