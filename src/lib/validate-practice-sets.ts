import type { ListeningTrack, PracticeQuestion, ReadingPassage } from "@/data/practice";
import type { PracticeSets } from "@/lib/store";

type ValidationResult = { sets: PracticeSets | null; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateQuestions(value: unknown, path: string, errors: string[]): value is PracticeQuestion[] {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${path} must contain at least one question.`);
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
  if (!isRecord(value)) return { sets: null, errors: ["JSON root must be an object with listening and reading arrays."] };
  if (!Array.isArray(value.listening) || !Array.isArray(value.reading)) {
    return { sets: null, errors: ["JSON root must contain listening and reading arrays."] };
  }

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
    if (kind === "listening" && (!Number.isInteger(item.durationSec) || (item.durationSec as number) <= 0)) {
      errors.push(`${path}.durationSec must be a positive integer.`);
    }
    if (kind === "reading" && (!Number.isInteger(item.wordCount) || (item.wordCount as number) <= 0)) {
      errors.push(`${path}.wordCount must be a positive integer.`);
    }
    validateQuestions(item.questions, `${path}.questions`, errors);
  };

  value.listening.forEach((item, i) => checkSet(item, "listening", i));
  value.reading.forEach((item, i) => checkSet(item, "reading", i));
  if (value.listening.length + value.reading.length === 0) errors.push("Upload at least one listening or reading set.");

  if (errors.length > 0) return { sets: null, errors };
  return {
    sets: {
      listening: value.listening as ListeningTrack[],
      reading: value.reading as ReadingPassage[],
    },
    errors,
  };
}