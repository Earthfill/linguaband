import Link from "next/link";
import { adminMocks, adminPracticeTracks, getVocabularyTopics } from "@/lib/store";
import { countAttention, practiceTrackStatus } from "@/lib/admin-status";
import { MetricCard } from "@/components/admin/MetricCard";
import { Icon, type IconName } from "@/components/icons";

export const dynamic = "force-dynamic";

const QUICK_LINKS: { href: string; title: string; description: string; icon: IconName; tone: string }[] = [
  { href: "/admin/uploads", title: "Upload content", description: "Mock exams, practice sets, writing & speaking tasks", icon: "upload", tone: "bg-blue-50 text-blue-700" },
  { href: "/admin/vocabulary", title: "Vocabulary", description: "Publish vocabulary topics and words", icon: "book", tone: "bg-emerald-50 text-emerald-700" },
  { href: "/admin/audio", title: "Audio jobs", description: "Monitor generation and retry failed jobs", icon: "waveform", tone: "bg-violet-50 text-violet-700" },
];

export default async function AdminDashboardPage() {
  const [mocks, listeningTracks, vocabularyTopics] = await Promise.all([adminMocks(), adminPracticeTracks(), getVocabularyTopics()]);

  const practiceReady = listeningTracks.filter((track) => practiceTrackStatus(track) === "ready").length;
  const mocksReady = mocks.filter((mock) => mock.status === "ready").length;
  const attention = countAttention(mocks, listeningTracks);
  const vocabularyWordCount = vocabularyTopics.reduce((total, topic) => total + topic.words.length, 0);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-violet-950 px-6 py-8 text-white shadow-xl shadow-violet-950/10 sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-14 -top-28 h-72 w-72 rounded-full border border-white/10" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-violet-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Content studio
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Admin dashboard</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-300">Manage practice content and keep audio generation on track from one place.</p>
          </div>
          <Link href="/admin/uploads" className="inline-flex w-fit rounded-full bg-white px-5 py-3 text-sm font-bold text-zinc-900 transition hover:bg-violet-50">
            Upload content <span className="ml-2" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section aria-label="Content and audio overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Mock exams" value={mocks.length} detail="Uploaded tests" tone="blue" />
        <MetricCard label="Listening tracks" value={listeningTracks.length} detail="Practice audio jobs" tone="violet" />
        <MetricCard label="Audio ready" value={practiceReady + mocksReady} detail="Available for playback" tone="green" />
        <MetricCard label="Needs attention" value={attention} detail="Audio jobs to review" tone="amber" />
      </section>

      {attention > 0 ? (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-100 text-amber-700"><Icon name="clock" size={18} /></span>
            <p className="text-sm font-medium text-amber-900">{attention} audio job{attention === 1 ? "" : "s"} need attention — failed, missing, or stuck.</p>
          </div>
          <Link href="/admin/audio" className="rounded-full bg-amber-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-800">
            Review audio jobs
          </Link>
        </section>
      ) : null}

      <section aria-label="Quick links">
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${link.tone}`}>
                <Icon name={link.icon} size={20} />
              </span>
              <h2 className="mt-4 font-display text-base font-bold text-zinc-900">{link.title}</h2>
              <p className="mt-1 text-sm leading-5 text-zinc-500">{link.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                Open <Icon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm text-zinc-600 shadow-sm">
        <p>
          Published vocabulary: <strong className="text-zinc-900">{vocabularyWordCount} words</strong> across <strong className="text-zinc-900">{vocabularyTopics.length} topics</strong>.
        </p>
        <a className="font-semibold text-blue-700 underline underline-offset-2" href="/vocabulary.json" download>
          Download sample vocabulary.json
        </a>
      </section>
    </div>
  );
}
