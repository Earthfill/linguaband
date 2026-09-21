import type { MockSection, WritingTask } from "../types";

// ---- Writing Task 1 · Email (27 min) ----
const emailTask: WritingTask = {
  id: "M1W1",
  task: "Writing Task 1",
  title: "Writing an Email",
  timeLimit: "27 min",
  wordTarget: "150–200 words",
  scenario:
    "You recently stayed at the Lakeside Hotel for a two-night weekend break. During your stay, the room you were given had a broken air-conditioner and, despite reporting it twice, nobody repaired it. Write an email to the hotel manager about your experience.\n\nYour email should include:\n• Your booking details\n• A clear description of the problem\n• What you would like the hotel to do",
  instructions: [
    "Address the manager appropriately in the opening salutation.",
    "State the reason for writing early in the first paragraph.",
    "Give enough detail for the hotel to find your booking.",
    "Close politely with a clear request.",
  ],
  sampleAnswer:
    "Subject: Complaint about room 412 — booking LK-2209\n\nDear Hotel Manager,\n\nI am writing to let you know about a problem I had during my recent stay at the Lakeside Hotel.\n\nI stayed in room 412 for two nights from September 12 to 14, under booking LK-2209. Unfortunately, the air-conditioner in the room did not work for the entire stay. I reported it to the front desk on both the first and second morning, but it was never repaired, and the room remained uncomfortably warm at night.\n\nI would appreciate it if you could look into why my reports were not acted on. As a gesture of good will, I would also like to request a partial refund of one night's charge, since the room did not meet the standard your hotel advertises.\n\nThank you for your attention, and I look forward to your reply.\n\nBest regards,\nDevon Patel",
  criteria: [
    { label: "Content", note: "Covers all three bullet points naturally and specifically." },
    { label: "Cohesion", note: "Paragraphs flow from reason → problem → request." },
    { label: "Word choice", note: "Formal but natural business phrases used accurately." },
    { label: "Grammar & tone", note: "Polite tone with correct sentence boundaries and register." },
  ],
};

// ---- Writing Task 2 · Survey Response (26 min) ----
const surveyTask: WritingTask = {
  id: "M1W2",
  task: "Writing Task 2",
  title: "Responding to Survey Questions",
  timeLimit: "26 min",
  wordTarget: "150–200 words",
  scenario:
    "The city is considering turning the main downtown street into a car-free, pedestrian-only zone every weekend. You received a survey with two questions.\n\nQuestion 1: Do you support or oppose the weekend car ban? Give one reason.\n\nQuestion 2: What is the most important change the city should make to support the ban?",
  instructions: [
    "Answer both questions fully in one response of 150–200 words.",
    "Give a clear opinion for each question with a reason and an example.",
    "Use paragraph breaks so each question is addressed clearly.",
    "Keep the tone friendly and semi-formal, as if writing to city staff.",
  ],
  sampleAnswer:
    "Dear City Planning Team,\n\nThank you for asking residents about the proposed weekend car ban downtown.\n\nOverall, I support the idea. When the street is closed for the summer festival, the area feels safer and more welcoming, and local cafés do noticeably more business. I believe a regular weekend closure would bring the same energy, so I would vote in favour.\n\nTo make the ban work, the most important change would be better transit and parking at the edge of the zone. Many visitors now drive downtown because the nearest bus stop is a twenty-minute walk away. Adding a free weekend shuttle from the two public parking lots, and running buses more often, would let people reach the area without circling for parking or giving up and driving home.\n\nThank you again for collecting feedback. I hope these suggestions help.\n\nSincerely,\nAmara Okafor",
  criteria: [
    { label: "Content", note: "Both survey questions answered clearly with reasons." },
    { label: "Organization", note: "Clear paragraphs for each question with a polite frame." },
    { label: "Vocabulary", note: "Range of linking words and topic-specific terms." },
    { label: "Length control", note: "Stays inside the 150–200 word target." },
  ],
};

const W1: MockSection = {
  id: "W1",
  skill: "writing",
  title: "Writing Task 1 · Email",
  instructions: "Write your email in the box. Aim for 150–200 words.",
  timeLimitSec: 1620,
  questions: [],
  writingTask: emailTask,
};

const W2: MockSection = {
  id: "W2",
  skill: "writing",
  title: "Writing Task 2 · Survey Response",
  instructions: "Write your response in the box. Aim for 150–200 words.",
  timeLimitSec: 1560,
  questions: [],
  writingTask: surveyTask,
};

export const mock01Writing: MockSection[] = [W1, W2];
