import Link from "next/link";
import {
  footerColumns,
  listeningParts,
  readingParts,
  writingParts,
  speakingParts,
} from "@/data/content";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";

function SupportLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
    >
      {label}
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-zinc-300">
      {/* Top: logo + description */}
      <Container>
        <div className="flex flex-col gap-6 py-14">
          <Logo />
          <p className="max-w-md text-sm leading-6 text-zinc-400">
            Linguaband is your all-in-one CELPIP prep hub — 4,000+ questions, timed
            mock tests, CLB-scored sample answers, and AI feedback on every
            Speaking and Writing response you submit.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 gap-10 border-t border-white/10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-100">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <SupportLink label={link.label} href={link.href} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Exam parts */}
        <div className="grid grid-cols-1 gap-8 border-t border-white/10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Listening", items: listeningParts },
            { title: "Reading", items: readingParts },
            { title: "Writing", items: writingParts },
            { title: "Speaking", items: speakingParts },
          ].map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-100">
                {group.title}
              </h3>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item}>
                    <span className="text-sm text-zinc-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-zinc-500">
                © {year} Linguaband.com · All rights reserved.
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {["Terms of Service", "Privacy Policy", "Refund Policy"].map((label) => (
                  <a
                    key={label}
                    href="#"
                    className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                  >
                    {label}
                  </a>
                ))}
                <button
                  type="button"
                  className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-100"
                >
                  Cookie Settings
                </button>
              </div>
            </div>

            <p className="max-w-4xl text-[11px] leading-5 text-zinc-600">
              Linguaband is an independent practice platform and is not affiliated
              with, endorsed by, sponsored by, or accredited by Prometric or
              Paragon Testing Enterprises Inc., the developers and owners of the
              CELPIP® test. Our practice content is study material only: it is
              not an official exam and does not produce official scores. Linguaband
              does not reproduce or distribute real exam questions, passages,
              recordings, answer keys, or score reports. Every scored practice
              item on this site is originally written by Linguaband. Where our
              practice format mirrors the exam owner&apos;s on-screen
              instructions or worked examples, short extracts of that
              instructional text may appear for format fidelity and remain the
              property of their owner.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
