import { getVocabularyTopics } from "@/lib/store";
import { VocabularyUpload } from "@/components/admin/VocabularyUpload";
import { SectionTitle } from "@/components/admin/SectionTitle";

export const dynamic = "force-dynamic";

export default async function AdminVocabularyPage() {
  const vocabularyTopics = await getVocabularyTopics();
  const wordCount = vocabularyTopics.reduce((total, topic) => total + topic.words.length, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900">Vocabulary</h1>
        <p className="mt-1 text-sm text-zinc-500">Publish vocabulary topics that feed the learner vocabulary page.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-zinc-500">Published words</p>
          <p className="mt-3 font-display text-3xl font-bold tracking-tight text-zinc-900">{wordCount}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-zinc-500">Topics</p>
          <p className="mt-3 font-display text-3xl font-bold tracking-tight text-zinc-900">{vocabularyTopics.length}</p>
        </div>
        <div className="flex items-center rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <a className="font-semibold text-blue-700 underline underline-offset-2" href="/api/admin/sample-json?kind=vocabulary" download>
            Download sample vocabulary.json
          </a>
        </div>
      </section>

      <SectionTitle
        eyebrow="Content management"
        title="Upload vocabulary"
        description="Upload a JSON array of topics; it replaces the current vocabulary content."
      />
      <VocabularyUpload />
    </div>
  );
}
