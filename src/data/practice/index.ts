import type { ListeningTrack, PracticeQuestion, ReadingPassage, SpeakingTask, WritingTask } from "./types";

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
  skill: "Listening" | "Reading" | "Writing" | "Speaking";
  source: string;
  setId: string;
};

export function buildQuestionBank(
  tracks: ListeningTrack[],
  passages: ReadingPassage[],
  writing: WritingTask[] = [],
  speaking: SpeakingTask[] = [],
): BankQuestion[] {
  return [
    ...tracks.flatMap((track) =>
      track.questions.map((q) => ({ ...q, skill: "Listening" as const, source: track.title, setId: track.id })),
    ),
    ...passages.flatMap((passage) =>
      passage.questions.map((q) => ({ ...q, skill: "Reading" as const, source: passage.title, setId: passage.id })),
    ),
    ...writing.map((task) => ({
      id: `${task.id}-prompt`, label: task.task, part: task.title, question: task.scenario,
      options: [], answerIndex: -1, explanation: task.sampleAnswer, skill: "Writing" as const,
      source: task.title, setId: task.id,
    })),
    ...speaking.map((task) => ({
      id: `${task.id}-prompt`, label: task.title, part: "Speaking", question: task.scenario,
      options: [], answerIndex: -1, explanation: task.sampleAnswer, skill: "Speaking" as const,
      source: task.title, setId: task.id,
    })),
  ];
}

