import type { MockExam } from "@/data/practice";

const NEW_BADGE_MS = 48 * 60 * 60 * 1000;

export function mockBadge(exam: MockExam, now: number): string {
  if (exam.badge !== "New") return exam.badge;
  const createdAt = exam.createdAt ? Date.parse(exam.createdAt) : Number.NaN;
  return Number.isFinite(createdAt) && now >= createdAt && now - createdAt < NEW_BADGE_MS
    ? "New"
    : "Challenging";
}

export function nextBadgeChange(exams: MockExam[], now: number): number | null {
  const changes = exams
    .filter((exam) => exam.badge === "New" && exam.createdAt)
    .map((exam) => Date.parse(exam.createdAt!) + NEW_BADGE_MS)
    .filter((time) => Number.isFinite(time) && time > now);
  return changes.length ? Math.min(...changes) : null;
}