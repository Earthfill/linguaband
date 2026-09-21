import type { MockExam } from "../types";
import { mock01Listening } from "./listening";
import { mock01Reading } from "./reading";
import { mock01Writing } from "./writing";
import { mock01Speaking } from "./speaking";

/**
 * Mock Test 01 — a full CELPIP-General style exam.
 * 20 sections in the official order: Listening (6) → Reading (4) → Writing (2) → Speaking (8).
 */
export const mock01: MockExam = {
  id: "mock-01",
  name: "Mock Test 01",
  badge: "Most popular",
  difficulty: "Standard",
  description: "A balanced full-length exam that mirrors the official format and timing.",
  sections: [...mock01Listening, ...mock01Reading, ...mock01Writing, ...mock01Speaking],
};
