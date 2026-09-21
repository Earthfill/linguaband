"use client";

import { useState } from "react";
import { faqs } from "@/data/faqs";
import { Icon } from "@/components/icons";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title="CELPIP Preparation FAQ"
            subtitle="Answers to the questions CELPIP candidates ask us most."
          />
        </Reveal>

        <Reveal>
          <div className="mx-auto max-w-3xl space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={faq.q}
                  className={`overflow-hidden rounded-2xl border transition-colors ${
                    isOpen ? "border-blue-200 bg-white" : "border-zinc-200 bg-white"
                  } shadow-sm`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  >
                    <span className="text-[15px] font-semibold text-zinc-900 sm:text-base">
                      {faq.q}
                    </span>
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors ${
                        isOpen ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      <Icon
                        name="chevron-down"
                        size={14}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="border-t border-zinc-100 px-5 pb-5 pt-4 text-[15px] leading-7 text-zinc-500 sm:px-6">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
