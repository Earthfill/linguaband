import { adminMocks, adminPracticeTracks } from "@/lib/store";
import { AudioJobs } from "@/components/admin/AudioJobs";

export const dynamic = "force-dynamic";

export default async function AdminAudioPage() {
  const [mocks, listeningTracks] = await Promise.all([adminMocks(), adminPracticeTracks()]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900">Audio jobs</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Monitor generated audio and retry tracks that need attention. Runs are queued via GitHub Actions and
          take about two minutes.
        </p>
      </header>
      <AudioJobs mocks={mocks} listeningTracks={listeningTracks} />
    </div>
  );
}
