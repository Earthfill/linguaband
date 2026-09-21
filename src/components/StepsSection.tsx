import { steps } from "@/data/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function StepsSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="How to prepare for the CELPIP exam"
            subtitle="Three simple steps between you and test-day confidence."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.step} delay={i * 100}>
              <div className="relative h-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <span className="font-display text-5xl font-bold text-zinc-100">
                  {step.step}
                </span>
                <span className="absolute right-6 top-6 grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-zinc-900">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-7 text-zinc-500">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
