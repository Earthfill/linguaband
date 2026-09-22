import type { MockExam } from "@/data/practice";

export type ValidationError = { path: string; message: string };

export type ValidationResult = { errors: ValidationError[]; warnings: string[] };

const SKILLS = ["listening", "reading", "writing", "speaking"] as const;

export function validateMock(exam: unknown, existingSectionIds: Set<string>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  const e = exam as Partial<MockExam> | null;

  if (!e || typeof e !== "object") {
    return { errors: [{ path: "root", message: "File must contain a JSON object" }], warnings: [] };
  }
  if (!e.id) errors.push({ path: "id", message: "Missing id" });
  if (!e.name) errors.push({ path: "name", message: "Missing name" });
  if (!e.badge) errors.push({ path: "badge", message: "Missing badge" });
  if (e.difficulty !== "Standard" && e.difficulty !== "Challenging") {
    errors.push({ path: "difficulty", message: "difficulty must be \"Standard\" or \"Challenging\"" });
  }
  if (!e.description) errors.push({ path: "description", message: "Missing description" });
  if (!Array.isArray(e.sections) || e.sections.length === 0) {
    errors.push({ path: "sections", message: "At least one section is required" });
    return { errors, warnings };
  }

  const seenSections = new Set<string>();
  const seenQuestions = new Set<string>();
  const questionCount: Record<"listening" | "reading", number> = { listening: 0, reading: 0 };

  for (const s of e.sections) {
    if (!s?.id) {
      errors.push({ path: "sections", message: "A section is missing its id" });
      continue;
    }
    if (seenSections.has(s.id)) {
      errors.push({ path: `sections.${s.id}.id`, message: `Duplicate section id "${s.id}"` });
    }
    seenSections.add(s.id);
    if (existingSectionIds.has(s.id)) {
      errors.push({
        path: `sections.${s.id}.id`,
        message: `Section id "${s.id}" already exists in another mock — audio would collide`,
      });
    }
    if (!SKILLS.includes(s.skill as (typeof SKILLS)[number])) {
      errors.push({ path: `sections.${s.id}.skill`, message: `Unknown skill "${String(s.skill)}"` });
    }
    if (s.skill === "listening" || s.skill === "reading") {
      questionCount[s.skill as "listening" | "reading"] += (s.questions ?? []).length;
    }
    for (const q of s.questions ?? []) {
      if (seenQuestions.has(q.id)) {
        errors.push({ path: `sections.${s.id}.questions.${q.id}`, message: `Duplicate question id "${q.id}"` });
      }
      seenQuestions.add(q.id);
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        errors.push({ path: `sections.${s.id}.questions.${q.id}.options`, message: "Exactly 4 options required" });
      }
      if (typeof q.answerIndex !== "number" || q.answerIndex < 0 || q.answerIndex > 3) {
        errors.push({ path: `sections.${s.id}.questions.${q.id}.answerIndex`, message: "answerIndex must be 0-3" });
      }
    }
    if (s.skill === "listening" && !/^[A-Z][A-Z ]*?:/.test(s.passage ?? "")) {
      errors.push({ path: `sections.${s.id}.passage`, message: "Listening passage must use \"SPEAKER: text\" lines" });
    }
    if (s.skill === "writing" && !s.writingTask) {
      errors.push({ path: `sections.${s.id}`, message: "Writing section needs a writingTask" });
    }
    if (s.skill === "speaking" && !s.speakingTask) {
      errors.push({ path: `sections.${s.id}`, message: "Speaking section needs a speakingTask" });
    }
  }

  if (questionCount.listening && questionCount.listening !== 38) {
    warnings.push(`Listening has ${questionCount.listening} questions (38 keeps the calibrated CLB score).`);
  }
  if (questionCount.reading && questionCount.reading !== 38) {
    warnings.push(`Reading has ${questionCount.reading} questions (38 keeps the calibrated CLB score).`);
  }

  return { errors, warnings };
}
