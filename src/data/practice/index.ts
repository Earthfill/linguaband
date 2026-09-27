import { listeningTracks } from "./listening";
import { readingPassages } from "./reading";
import type { PracticeQuestion } from "./types";

export { listeningTracks } from "./listening";
export { readingPassages } from "./reading";
export { writingTasks } from "./writing";
export { speakingTasks } from "./speaking";
export { mockExams, speakingOverview } from "./exams";
export { mock01 } from "./mock01";
export type {
  PracticeQuestion,
  ListeningTrack,
  ReadingPassage,
  WritingTask,
  SpeakingTask,
  MockSkill,
  MockSection,
  MockExam,
} from "./types";

export type BankQuestion = PracticeQuestion & {
  skill: "Listening" | "Reading";
  source: string;
};

export function buildQuestionBank(
  tracks: typeof listeningTracks,
  passages: typeof readingPassages,
): BankQuestion[] {
  return [
    ...tracks.flatMap((track) =>
      track.questions.map((q) => ({ ...q, skill: "Listening" as const, source: track.title })),
    ),
    ...passages.flatMap((passage) =>
      passage.questions.map((q) => ({ ...q, skill: "Reading" as const, source: passage.title })),
    ),
  ];
}

/**
 * Combined question bank used by the /questions page.
 * Every question carries a skill + source so it can be filtered.
 */
export const questionBank: BankQuestion[] = buildQuestionBank(listeningTracks, readingPassages);

