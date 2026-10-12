import { adminMocks, adminPracticeTracks, listPracticeSets } from "@/lib/store";
import { practiceTrackStatus } from "@/lib/admin-status";
import { UploadForms } from "@/components/admin/UploadForms";

export const dynamic = "force-dynamic";

export default async function AdminUploadsPage() {
  const [mocks, listeningTracks, sets] = await Promise.all([adminMocks(), adminPracticeTracks(), listPracticeSets()]);
  const stats: { label: string; value: number }[] = [
    { label: "Mock exams", value: mocks.length },
    { label: "Listening sets", value: sets.listening.length },
    { label: "Reading sets", value: sets.reading.length },
    { label: "Writing tasks", value: sets.writing.length },
    { label: "Speaking tasks", value: sets.speaking.length },
  ];
  const listeningWithoutAudio = listeningTracks.filter((track) => practiceTrackStatus(track) !== "ready").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900">Uploads</h1>
        <p className="mt-1 text-sm text-zinc-500">Add mock exams, practice sets, and writing &amp; speaking tasks.</p>
      </header>

      <section aria-label="Published content" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
            <p className="font-display text-2xl font-bold tracking-tight text-zinc-900">{stat.value}</p>
            <p className="mt-0.5 text-xs font-medium text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </section>

      <div className="flex items-start gap-2.5 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm text-zinc-600 shadow-sm">
        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-700">i</span>
        <p>
          {listeningWithoutAudio > 0 ? (
            <>
              <strong className="text-zinc-900">{listeningWithoutAudio} listening track{listeningWithoutAudio === 1 ? "" : "s"}</strong>{" "}
              still need audio — check the{" "}
              <a href="/admin/audio" className="font-semibold text-blue-700 underline underline-offset-2">
                Audio jobs
              </a>{" "}
              queue.
            </>
          ) : (
            <>Everything is published. Upload a file below to add or replace content.</>
          )}
        </p>
      </div>

      <UploadForms />
    </div>
  );
}
