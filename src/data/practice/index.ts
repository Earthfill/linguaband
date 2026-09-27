import type { ListeningTrack, PracticeQuestion, ReadingPassage } from "./types";

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
  setId: string;
};

export function buildQuestionBank(
  tracks: ListeningTrack[],
  passages: ReadingPassage[],
): BankQuestion[] {
  return [
    ...tracks.flatMap((track) =>
      track.questions.map((q) => ({ ...q, skill: "Listening" as const, source: track.title, setId: track.id })),
    ),
    ...passages.flatMap((passage) =>
      passage.questions.map((q) => ({ ...q, skill: "Reading" as const, source: passage.title, setId: passage.id })),
    ),
  ];
}

