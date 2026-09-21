import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { PracticeHero } from "@/components/practice/PracticeHero";
import { ListeningBrowser } from "@/components/practice/ListeningBrowser";

const parts = [
  "Problem Solving",
  "Daily Life Conversation",
  "Information",
  "News Item",
  "Discussion",
  "Viewpoints",
];

export default function ListeningPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PracticeHero
          eyebrow="Practice · Listening"
          title="Sharpen every part of the CELPIP listening test"
          description="Play the audio mock, follow the transcript, then answer with instant feedback. Works on desktop and mobile."
          crumbs={[{ label: "Home", href: "/" }, { label: "Listening", href: "/listening" }]}
        />

        <section className="py-12 sm:py-16">
          <Container>
            <div className="mb-8 flex flex-wrap gap-2">
              {parts.map((part) => (
                <span
                  key={part}
                  className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-zinc-600"
                >
                  Part · {part}
                </span>
              ))}
            </div>
            <ListeningBrowser />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
