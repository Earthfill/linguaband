import type { ListeningTrack, PracticeQuestion, ReadingPassage, SpeakingTask, WritingTask } from "@/data/practice";
import type { PracticeSets } from "@/lib/store";

const MIN_QUESTIONS_PER_SET = 15;
const MAX_QUESTIONS_PER_SET = 20;

type ValidationResult = { sets: PracticeSets | null; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateQuestions(value: unknown, path: string, errors: string[]): value is PracticeQuestion[] {
  if (!Array.isArray(value) || value.length < MIN_QUESTIONS_PER_SET || value.length > MAX_QUESTIONS_PER_SET) {
    errors.push(`${path} must contain ${MIN_QUESTIONS_PER_SET}–${MAX_QUESTIONS_PER_SET} questions (received ${Array.isArray(value) ? value.length : 0}).`);
    return false;
  }
  const ids = new Set<string>();
  value.forEach((item, index) => {
    const prefix = `${path}[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${prefix} must be an object.`);
      return;
    }
    for (const field of ["id", "label", "part", "question", "explanation"]) {
      if (!nonEmptyString(item[field])) errors.push(`${prefix}.${field} must be a non-empty string.`);
    }
    if (typeof item.id === "string") {
      if (ids.has(item.id)) errors.push(`${path} contains duplicate question ID "${item.id}".`);
      ids.add(item.id);
    }
    if (!Array.isArray(item.options) || item.options.length !== 4 || !item.options.every(nonEmptyString)) {
      errors.push(`${prefix}.options must contain exactly four non-empty strings.`);
    }
    if (!Number.isInteger(item.answerIndex) || (item.answerIndex as number) < 0 || (item.answerIndex as number) > 3) {
      errors.push(`${prefix}.answerIndex must be an integer from 0 to 3.`);
    }
  });
  return true;
}

export function validatePracticeSets(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(value)) return { sets: null, errors: ["JSON root must be an object containing skill arrays."] };
  const skills = ["listening", "reading", "writing", "speaking"] as const;
  if (skills.some((skill) => value[skill] !== undefined && !Array.isArray(value[skill]))) {
    return { sets: null, errors: ["Each provided skill must be an array."] };
  }
  const listeningItems = (value.listening ?? []) as unknown[];
  const readingItems = (value.reading ?? []) as unknown[];
  const writingItems = (value.writing ?? []) as unknown[];
  const speakingItems = (value.speaking ?? []) as unknown[];

  const allIds = new Set<string>();
  const checkSet = (item: unknown, kind: "listening" | "reading", index: number) => {
    const path = `${kind}[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${path} must be an object.`);
      return;
    }
    if (!nonEmptyString(item.id)) errors.push(`${path}.id must be a non-empty string.`);
    else {
      if (allIds.has(item.id)) errors.push(`Set ID "${item.id}" is repeated in this upload.`);
      allIds.add(item.id);
    }
    for (const field of kind === "listening"
      ? ["title", "part", "setting", "speaker", "trackLabel", "transcript"]
      : ["title", "part", "timeLimit", "passage"]) {
      if (!nonEmptyString(item[field])) errors.push(`${path}.${field} must be a non-empty string.`);
    }
    if (item.image !== undefined &&
      (typeof item.image !== "string" || !/^[\w.-]+\.(?:png|jpe?g|webp)$/i.test(item.image))) {
      errors.push(`${path}.image must be a filename ending in .png, .jpg, .jpeg, or .webp.`);
    }
    if (item.imageAlt !== undefined && !nonEmptyString(item.imageAlt)) {
      errors.push(`${path}.imageAlt must be a non-empty string when provided.`);
    }
    if (kind === "listening" && (!Number.isInteger(item.durationSec) || (item.durationSec as number) <= 0)) {
      errors.push(`${path}.durationSec must be a positive integer.`);
    }
    if (kind === "reading" && (!Number.isInteger(item.wordCount) || (item.wordCount as number) <= 0)) {
      errors.push(`${path}.wordCount must be a positive integer.`);
    }
    validateQuestions(item.questions, `${path}.questions`, errors);
  };

  listeningItems.forEach((item, i) => checkSet(item, "listening", i));
  readingItems.forEach((item, i) => checkSet(item, "reading", i));

  const checkTask = (item: unknown, kind: "writing" | "speaking", index: number) => {
    const path = `${kind}[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${path} must be an object.`);
      return;
    }
    if (!nonEmptyString(item.id)) errors.push(`${path}.id must be a non-empty string.`);
    else {
      if (allIds.has(item.id)) errors.push(`Set ID "${item.id}" is repeated in this upload.`);
      allIds.add(item.id);
    }
    const fields = kind === "writing"
      ? ["task", "title", "timeLimit", "wordTarget", "scenario", "sampleAnswer"]
      : ["title", "scenario", "sampleAnswer", "clb"];
    for (const field of fields) {
      if (!nonEmptyString(item[field])) errors.push(`${path}.${field} must be a non-empty string.`);
    }
    if (kind === "writing") {
      if (!Array.isArray(item.instructions) || item.instructions.length === 0 || !item.instructions.every(nonEmptyString)) {
        errors.push(`${path}.instructions must contain at least one non-empty string.`);
      }
      if (!Array.isArray(item.criteria) || item.criteria.length === 0 || !item.criteria.every((criterion) =>
        isRecord(criterion) && nonEmptyString(criterion.label) && nonEmptyString(criterion.note))) {
        errors.push(`${path}.criteria must contain objects with non-empty label and note strings.`);
      }
    } else {
      for (const field of ["prepTimeSec", "speakTimeSec"]) {
        if (!Number.isInteger(item[field]) || (item[field] as number) <= 0) errors.push(`${path}.${field} must be a positive integer.`);
      }
      if (!Array.isArray(item.tips) || item.tips.length === 0 || !item.tips.every(nonEmptyString)) {
        errors.push(`${path}.tips must contain at least one non-empty string.`);
      }
    }
  };
  writingItems.forEach((item, i) => checkTask(item, "writing", i));
  speakingItems.forEach((item, i) => checkTask(item, "speaking", i));
  if (listeningItems.length + readingItems.length + writingItems.length + speakingItems.length === 0) {
    errors.push("Upload at least one practice set or task.");
  }

  if (errors.length > 0) return { sets: null, errors };
  return {
    sets: {
      listening: listeningItems as ListeningTrack[],
      reading: readingItems as ReadingPassage[],
      writing: writingItems as WritingTask[],
      speaking: speakingItems as SpeakingTask[],
    },
    errors,
  };
}