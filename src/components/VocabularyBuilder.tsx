"use client";

import { useMemo, useState } from "react";
import type { VocabularyTopic } from "@/data/vocabulary";

export function VocabularyBuilder({ topics }: { topics: VocabularyTopic[] }) {
  const [activeTopic, setActiveTopic] = useState(0);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const topic = topics[activeTopic]!;
  const quizWord = topic.words[quizIndex % topic.words.length]!;
  const options = useMemo(() => {
    const distractors = topic.words.filter((word) => word.word !== quizWord.word).slice(0, 3);
    const answers = [...distractors.map((word) => word.definition), quizWord.definition];
    return answers;
  }, [quizWord, topic.words]);
  const correctAnswer = options.indexOf(quizWord.definition);

  function chooseTopic(index: number) {
    setActiveTopic(index);
    setQuizIndex(0);
    setSelectedAnswer(null);
  }

  function nextQuestion() {
    setQuizIndex((current) => (current + 1) % topic.words.length);
    setSelectedAnswer(null);
  }

  function toggleSaved(word: string) {
    setSavedWords((current) => current.includes(word)
      ? current.filter((saved) => saved !== word)
      : [...current, word]);
  }

  return (
    <div>
      <div className="mb-7 flex flex-wrap gap-2" aria-label="Vocabulary topics">
        {topics.map((item, index) => (
          <button key={item.name} type="button" onClick={() => chooseTopic(index)} aria-pressed={activeTopic === index}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${activeTopic === index ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"}`}>
            {item.name}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
        <section aria-labelledby="topic-heading">
          <div className="mb-5">
            <p className="text-sm text-zinc-500">{topic.description}</p>
            <h2 id="topic-heading" className="mt-2 font-display text-2xl font-bold text-zinc-900">Words to know</h2>
          </div>
          <div className="space-y-4">
            {topic.words.map((word) => {
              const saved = savedWords.includes(word.word);
              return (
                <article key={word.word} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h3 className="font-display text-xl font-bold text-zinc-900">{word.word}</h3>
                        <span className="text-xs font-medium text-zinc-400">{word.partOfSpeech}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">{word.definition}</p>
                    </div>
                    <button type="button" onClick={() => toggleSaved(word.word)} aria-pressed={saved}
                      className="shrink-0 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:border-blue-200 hover:text-blue-700">
                      {saved ? "Saved ✓" : "Save word"}
                    </button>
                  </div>
                  <p className="mt-4 border-l-2 border-blue-200 pl-3 text-sm leading-6 text-zinc-600">“{word.example}”</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Often used with</span>
                    {word.collocations.map((collocation) => (
                      <span key={collocation} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">{collocation}</span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl bg-zinc-900 p-6 text-white sm:p-7" aria-labelledby="quiz-heading">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">Quick practice · {quizIndex + 1} of {topic.words.length}</p>
            <h2 id="quiz-heading" className="mt-3 font-display text-xl font-bold">What does “{quizWord.word}” mean?</h2>
            <div className="mt-5 space-y-2">
              {options.map((option, index) => {
                const isCorrect = index === correctAnswer;
                const stateClass = selectedAnswer === null
                  ? "border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
                  : isCorrect
                    ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-100"
                    : selectedAnswer === index
                      ? "border-rose-400/40 bg-rose-400/15 text-rose-100"
                      : "border-white/10 bg-white/5 text-zinc-400";
                return (
                  <button key={option} type="button" disabled={selectedAnswer !== null}
                    onClick={() => setSelectedAnswer(index)}
                    className={`w-full rounded-xl border p-3 text-left text-sm leading-5 transition-colors disabled:cursor-default ${stateClass}`}>
                    {option}
                  </button>
                );
              })}
            </div>
            {selectedAnswer !== null ? (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p role="status" className="text-sm font-medium text-zinc-200">
                  {selectedAnswer === correctAnswer ? "That’s right!" : `Not quite. ${quizWord.word} means ${quizWord.definition.toLowerCase()}`}
                </p>
                <button type="button" onClick={nextQuestion} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100">Next</button>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6" aria-labelledby="saved-heading">
            <div className="flex items-center justify-between gap-3">
              <h2 id="saved-heading" className="font-display text-lg font-bold text-zinc-900">Your word list</h2>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">{savedWords.length}</span>
            </div>
            {savedWords.length ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {savedWords.map((word) => (
                  <li key={word}>
                    <button type="button" onClick={() => toggleSaved(word)} title={`Remove ${word}`}
                      className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:border-rose-200 hover:text-rose-700">
                      {word} <span aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-zinc-500">Save words as you study and they’ll collect here for this visit.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}