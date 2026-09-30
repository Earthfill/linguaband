import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { VocabularyBuilder } from "@/components/VocabularyBuilder";
import { Container } from "@/components/ui/Container";
import { PracticeHero } from "@/components/practice/PracticeHero";
import { getVocabularyTopics } from "@/lib/store";

export const metadata: Metadata = {
  title: "CELPIP Vocabulary Builder | Linguaband",
  description:
    "Build practical CELPIP vocabulary with topic-based words, clear examples, collocations, and quick quizzes.",
};

export default async function VocabularyPage() {
  const topics = await getVocabularyTopics();
  return (
    <>
      <Header />
      <main className="flex-1">
        <PracticeHero
          eyebrow="Study tools · Vocabulary"
          title="Find the right words for every CELPIP task"
          description="Explore useful vocabulary by topic, learn natural word pairings, and check your understanding with a quick quiz."
          crumbs={[{ label: "Home", href: "/" }, { label: "Vocabulary", href: "/vocabulary" }]}
        />
        <section className="py-12 sm:py-16">
          <Container>
            {topics.length > 0 ? (
              <VocabularyBuilder topics={topics} />
            ) : (
              <section className="mx-auto max-w-2xl rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center sm:p-12">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-lg font-bold text-blue-700">Aa</span>
                <h2 className="mt-5 font-display text-2xl font-bold text-zinc-900">Vocabulary is being prepared</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-600">There are no vocabulary topics published yet. Please check back after new study materials are added.</p>
              </section>
            )}
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}