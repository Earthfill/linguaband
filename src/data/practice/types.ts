export type PracticeQuestion = {
  id: string;
  label: string; // e.g. "Question 1"
  part: string; // e.g. "Part 1 · Problem Solving"
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type ListeningTrack = {
  id: string;
  title: string;
  part: string;
  setting: string;
  speaker: string;
  durationSec: number;
  trackLabel: string;
  transcript: string;
  questions: PracticeQuestion[];
};

export type ReadingPassage = {
  id: string;
  title: string;
  part: string;
  wordCount: number;
  timeLimit: string;
  passage: string;
  questions: PracticeQuestion[];
};

export type WritingTask = {
  id: string;
  task: string;
  title: string;
  timeLimit: string;
  wordTarget: string;
  scenario: string;
  instructions: string[];
  sampleAnswer: string;
  criteria: { label: string; note: string }[];
};

export type SpeakingTask = {
  id: string;
  title: string;
  scenario: string;
  prepTimeSec: number;
  speakTimeSec: number;
  tips: string[];
  sampleAnswer: string;
  clb: string;
};

export type MockSkill = "listening" | "reading" | "writing" | "speaking";

/**
 * One timed part of a full mock exam. A full CELPIP-General mock is 20 sections:
 * 6 Listening + 4 Reading + 2 Writing + 8 Speaking, in that order.
 */
export type MockSection = {
  id: string; // e.g. "L1", "R2", "W1", "S3"
  skill: MockSkill;
  title: string; // e.g. "Part 1 · Listening to Problem Solving"
  instructions: string;
  timeLimitSec: number;
  /** Reading passage text, or the listening audio script (transcript). */
  passage?: string;
  passageTitle?: string;
  /** Listening & Reading (multiple-choice). */
  questions: PracticeQuestion[];
  /** Writing section carries one WritingTask. */
  writingTask?: WritingTask;
  /** Speaking section carries one SpeakingTask. */
  speakingTask?: SpeakingTask;
};

export type MockExam = {
  id: string;
  name: string;
  badge: string;
  difficulty: "Standard" | "Challenging";
  description: string;
  sections: MockSection[];
};
