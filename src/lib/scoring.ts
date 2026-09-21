import type { MockExam, MockSkill, PracticeQuestion } from "@/data/practice";

/**
 * CELPIP → CLB scoring helpers.
 *
 * CELPIP scores map 1:1 to CLB levels (M, 3–12). CELPIP uses Item Response
 * Theory (IRT) and does not publish exact raw-score cutoffs, so the tables
 * below are ESTIMATES for practice feedback only — never an official result.
 */

// Raw-score cutoffs for the 38-question Listening & Reading sections.
// [raw, clb] — first match wins (highest raw first).
const LR_THRESHOLDS: Array<[number, number]> = [
  [38, 12],
  [37, 11],
  [35, 10],
  [32, 9],
  [29, 8],
  [26, 7],
  [23, 6],
  [19, 5],
  [15, 4],
  [10, 3],
];

/** Approximate percent → CLB for non-38-item scales (e.g. Writing heuristic). */
export function clbFromPercent(pct: number): number | null {
  if (pct >= 96) return 12;
  if (pct >= 92) return 11;
  if (pct >= 85) return 10;
  if (pct >= 78) return 9;
  if (pct >= 70) return 8;
  if (pct >= 62) return 7;
  if (pct >= 54) return 6;
  if (pct >= 45) return 5;
  if (pct >= 36) return 4;
  if (pct >= 26) return 3;
  return null; // below CLB 3 → "M"
}

export function clbFromRaw(raw: number, max: number): number | null {
  if (max <= 0) return null;
  if (max === 38) {
    for (const [r, clb] of LR_THRESHOLDS) {
      if (raw >= r) return clb;
    }
    return null;
  }
  return clbFromPercent(Math.round((raw / max) * 100));
}

export function clbLabel(clb: number | null): string {
  return clb === null ? "M" : String(clb);
}

const DISCOURSE_MARKERS = [
  "first",
  "second",
  "third",
  "finally",
  "however",
  "therefore",
  "additionally",
  "for example",
  "in addition",
  "as a result",
  "moreover",
  "furthermore",
];

export type WritingFeedback = {
  length: number;
  cohesion: number;
  structure: number;
  pct: number;
};

/** Heuristic Writing preview (same approach as the standalone WritingWorkspace). */
export function analyzeWriting(text: string, wordTarget: string): WritingFeedback {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const words = wordTarget.match(/\d+/g)?.map(Number) ?? [150, 150];
  const targetMax = words[1] ?? words[0] ?? 200;
  const sentences = (text.match(/[.!?]+/g) ?? []).length;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).length : 0;
  const markers = DISCOURSE_MARKERS.filter((m) =>
    text.toLowerCase().includes(m),
  ).length;

  const length = Math.min(100, Math.round((wordCount / targetMax) * 100));
  const cohesion = Math.min(Math.round((markers / 3) * 100) + (paragraphs >= 2 ? 20 : 0), 100);
  const structure = Math.round(
    ((sentences >= 8 ? 1 : sentences / 8) + (paragraphs >= 2 ? 1 : 0)) * 50,
  );
  const pct = Math.max(0, Math.min(100, Math.round((length + cohesion + structure) / 3)));
  return { length, cohesion, structure, pct };
}

export type SkillResult = {
  skill: MockSkill;
  label: string;
  raw: number;
  max: number;
  clb: number | null;
};

export type SectionReview = {
  sectionId: string;
  title: string;
  skill: MockSkill;
  timeLimitSec: number;
  timeUsedSec: number;
  items?: Array<{ question: PracticeQuestion; selected: number | null }>;
  writingText?: string;
  writing?: WritingFeedback;
  speakingClb?: number | null;
};

export type ExamReport = {
  examId: string;
  examName: string;
  overallClb: number | null;
  skills: SkillResult[];
  sections: SectionReview[];
};

const SKILL_LABELS: Record<MockSkill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export function buildReport(opts: {
  exam: MockExam;
  answers: Record<string, number | null>;
  writingTexts: Record<string, string>;
  speakingClbs: Record<string, number | null>;
  timeUsed: Record<string, number>;
}): ExamReport {
  const { exam, answers, writingTexts, speakingClbs, timeUsed } = opts;

  const rawBySkill: Record<MockSkill, number> = {
    listening: 0,
    reading: 0,
    writing: 0,
    speaking: 0,
  };
  const maxBySkill: Record<MockSkill, number> = {
    listening: 0,
    reading: 0,
    writing: 0,
    speaking: 0,
  };
  const writingPcts: number[] = [];
  const speakingLevels: number[] = [];

  const sections: SectionReview[] = exam.sections.map((section) => {
    const base = {
      sectionId: section.id,
      title: section.title,
      skill: section.skill,
      timeLimitSec: section.timeLimitSec,
      timeUsedSec: Math.max(0, Math.min(timeUsed[section.id] ?? 0, section.timeLimitSec)),
    };

    if (section.skill === "listening" || section.skill === "reading") {
      let correct = 0;
      const items = section.questions.map((q) => {
        const selected = answers[q.id] ?? null;
        if (selected === q.answerIndex) correct += 1;
        return { question: q, selected };
      });
      rawBySkill[section.skill] += correct;
      maxBySkill[section.skill] += section.questions.length;
      return { ...base, items };
    }

    if (section.skill === "writing" && section.writingTask) {
      const text = writingTexts[section.id] ?? "";
      const writing = analyzeWriting(text, section.writingTask.wordTarget);
      writingPcts.push(writing.pct);
      rawBySkill.writing += writing.pct;
      maxBySkill.writing += 100;
      return { ...base, writingText: text, writing };
    }

    if (section.skill === "speaking" && section.speakingTask) {
      const clb = speakingClbs[section.id] ?? null;
      if (clb !== null) speakingLevels.push(clb);
      return { ...base, speakingClb: clb };
    }

    return base;
  });

  const skills: SkillResult[] = (["listening", "reading", "writing", "speaking"] as MockSkill[]).map(
    (skill) => {
      let clb: number | null = null;
      if (skill === "listening" || skill === "reading") {
        clb = clbFromRaw(rawBySkill[skill], maxBySkill[skill]);
      } else if (skill === "writing") {
        clb = writingPcts.length
          ? clbFromPercent(Math.round(writingPcts.reduce((a, b) => a + b, 0) / writingPcts.length))
          : null;
      } else if (skill === "speaking") {
        clb = speakingLevels.length
          ? Math.round(speakingLevels.reduce((a, b) => a + b, 0) / speakingLevels.length)
          : null;
      }
      return {
        skill,
        label: SKILL_LABELS[skill],
        raw: skill === "writing" || skill === "speaking" ? 0 : rawBySkill[skill],
        max: skill === "writing" || skill === "speaking" ? 0 : maxBySkill[skill],
        clb,
      };
    },
  );

  const levels = skills.map((s) => s.clb).filter((c): c is number => c !== null);
  const overallClb = levels.length
    ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length)
    : null;

  return {
    examId: exam.id,
    examName: exam.name,
    overallClb,
    skills,
    sections,
  };
}
