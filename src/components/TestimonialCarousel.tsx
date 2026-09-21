"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { testimonials } from "@/data/testimonials";
import { IconStar } from "@/components/icons";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const AUTOPLAY_MS = 6000;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function avatarColor(name: string) {
  const palette = [
    "bg-blue-600",
    "bg-violet-600",
    "bg-teal-600",
    "bg-rose-500",
    "bg-amber-500",
    "bg-emerald-600",
    "bg-indigo-600",
    "bg-cyan-600",
    "bg-pink-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

export function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((v) => (v + 1) % testimonials.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const current = testimonials[index];

  return (
    <section id="reviews" className="bg-zinc-100/60 py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Reviews"
            title="What 140,000+ CELPIP candidates say"
            subtitle="Genuine feedback from real test takers, refreshed every week."
          />
        </Reveal>

        <Reveal>
          <div
            className="relative mx-auto max-w-2xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-lg shadow-zinc-900/5">
              <div className="flex flex-col items-center gap-6 p-8 sm:p-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IconStar key={i} className="h-5 w-5" />
                    ))}
                  </div>
                  <p className="font-display text-2xl font-bold text-zinc-900">4.9</p>
                </div>

                <blockquote
                  key={index}
                  className="animate-reveal min-h-[8.5rem] text-center text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8"
                >
                  “{current.quote}”
                </blockquote>

                <div className="flex flex-col items-center gap-2 text-center">
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-full ${avatarColor(
                      current.name,
                    )} text-sm font-bold text-white`}
                  >
                    {initials(current.name)}
                  </span>
                  <div>
                    <p className="font-semibold text-zinc-900">{current.name}</p>
                    <p className="text-sm text-zinc-500">{current.title}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="mt-6 flex items-center justify-center gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-5 bg-zinc-800" : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
                  }`}
                />
              ))}
            </div>

            <p className="mt-5 text-center text-sm text-zinc-500">
              Read all{" "}
              <Link
                href="/reviews"
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                student reviews
              </Link>
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
