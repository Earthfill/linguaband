import type { IconName } from "@/components/icons";

/* ------------------------------------------------------------------ */
/* Hero                                                                 */
/* ------------------------------------------------------------------ */
export const skillPills = [
  "Listening",
  "Reading",
  "Writing",
  "Speaking",
  "Mock Tests",
  "Courses",
  "Templates",
  "Vocabulary",
];

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */
export const stats = [
  { value: 140, suffix: "K+", label: "CELPIP candidates", decimals: 0 },
  { value: 4.9, suffix: "★", label: "Average rating", decimals: 1 },
  { value: 1.5, suffix: "M+", label: "Scores calculated", decimals: 1 },
  { value: 6, suffix: "M+", label: "Questions answered", decimals: 0 },
];

/* ------------------------------------------------------------------ */
/* AI-powered practice cards                                            */
/* ------------------------------------------------------------------ */
export type Feature = {
  icon: IconName;
  title: string;
  tagline: string;
  description: string;
  cta: string;
  href: string;
  accent: string;
};

export const features: Feature[] = [
  {
    icon: "clipboard",
    title: "Mock Exams",
    tagline: "Full-length tests with the exact format, timing & scoring",
    description:
      "Sit timed simulations that mirror the official exam — same section order, clock, and difficulty. Walk into test day calm instead of second-guessing yourself.",
    cta: "Try Mock Exams",
    href: "/exams",
    accent: "bg-blue-50 text-blue-600",
  },
  {
    icon: "sparkles",
    title: "AI Scoring",
    tagline: "Tutor-level feedback, delivered in seconds",
    description:
      "Receive friendly, specific, and motivating feedback aligned to the official CELPIP rubric — so you always know exactly what to improve next.",
    cta: "Try AI Feedback",
    href: "/writing",
    accent: "bg-violet-50 text-violet-600",
  },
  {
    icon: "bulb",
    title: "Explanations",
    tagline: "Answer breakdowns that actually teach",
    description:
      "Every question comes with a clear walkthrough of why each option wins or loses, so the lesson sticks long after you close the tab.",
    cta: "Try Practice Questions",
    href: "/questions",
    accent: "bg-teal-50 text-teal-600",
  },
];

/* ------------------------------------------------------------------ */
/* Courses                                                             */
/* ------------------------------------------------------------------ */
export type Course = {
  icon: IconName;
  title: string;
  description: string;
  badge?: string;
  href: string;
  accentBg: string;
  accentText: string;
};
export const courses: Course[] = [
  {
    icon: "pen",
    title: "CELPIP Writing Course",
    description:
      "Learn both writing tasks step by step — with reusable templates and AI-scored essays for instant feedback.",
    badge: "Skill course",
    href: "/courses/celpip-writing",
    accentBg: "bg-blue-50",
    accentText: "text-blue-600",
  },
  {
    icon: "mic",
    title: "CELPIP Speaking Course",
    description:
      "Work through all 8 speaking tasks with model answers, sample recordings, and instant AI scoring.",
    badge: "Skill course",
    href: "/courses/celpip-speaking",
    accentBg: "bg-violet-50",
    accentText: "text-violet-600",
  },
  {
    icon: "headphones",
    title: "CELPIP Listening Course",
    description:
      "Sharpen every listening task type — from Problem Solving to Viewpoints — with transcripts and re-listens.",
    badge: "Skill course",
    href: "/courses/celpip-listening",
    accentBg: "bg-amber-50",
    accentText: "text-amber-600",
  },
  {
    icon: "book",
    title: "Vocabulary & Collocations Kit",
    description:
      "Borrow the exact words and phrases that examiners want to hear in your Writing and Speaking answers.",
    badge: "Vocabulary",
    href: "/courses/celpip-vocabulary-collocations-kit",
    accentBg: "bg-emerald-50",
    accentText: "text-emerald-600",
  },
];


/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */
export type TemplateCard = {
  icon: IconName;
  group: string;
  title: string;
  description: string;
  tags: string[];
  level: string;
  href: string;
};

export const templates: TemplateCard[] = [
  {
    icon: "message",
    group: "Speaking",
    title: "Task 1 Template: Giving Advice",
    description:
      "Reply to a friend's problem with a calm, natural structure built on proven linking phrases.",
    tags: ["Speaking Task 1", "Advice"],
    level: "CLB 7–10",
    href: "/learn/speaking-task-1-template-giving-advice",
  },
  {
    icon: "user",
    group: "Speaking",
    title: "Task 2 Template: Personal Experience",
    description:
      "Narrate a personal story with a clear setup, middle, and takeaway — tight enough for 60 seconds.",
    tags: ["Speaking Task 2"],
    level: "CLB 7–10",
    href: "/learn",
  },
  {
    icon: "camera",
    group: "Speaking",
    title: "Task 3 Template: Describing a Scene",
    description:
      "Describe any picture with a formula that hits every scoring point without ever running out of things to say.",
    tags: ["Speaking Task 3"],
    level: "CLB 7–10",
    href: "/learn",
  },
  {
    icon: "mail",
    group: "Writing",
    title: "Writing Task 1: Writing an Email",
    description:
      "One repeatable email blueprint for every prompt — complaint, invitation, explanation, or request.",
    tags: ["Writing Task 1", "Email"],
    level: "CLB 8–12",
    href: "/learn/celpip-writing-task-1-template-writing-an-email",
  },
  {
    icon: "clipboard-list",
    group: "Writing",
    title: "Writing Task 2: Responding to Survey Questions",
    description:
      "Answer two survey prompts with an opinion-plus-example formula that always fills the word count.",
    tags: ["Writing Task 2", "Survey"],
    level: "CLB 8–12",
    href: "/learn/celpip-writing-task-2-template-responding-to-survey-questions",
  },
];

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */
export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export const footerColumns: FooterColumn[] = [
  {
    title: "Practice Tests",
    links: [
      { label: "Practice Tests", href: "/questions" },
      { label: "Mock Exams", href: "/exams" },
      { label: "Question Bank", href: "/questions" },
      { label: "Listening Practice", href: "/listening" },
      { label: "Reading Practice", href: "/reading" },
      { label: "Writing Practice", href: "/writing" },
      { label: "Speaking Practice", href: "/speaking" },
    ],
  },
  {
    title: "CELPIP Courses",
    links: [
      { label: "Writing Course", href: "/courses/celpip-writing" },
      { label: "Speaking Course", href: "/courses/celpip-speaking" },
      { label: "Listening Course", href: "/courses/celpip-listening" },
      { label: "Reading Course", href: "/courses/celpip-reading" },
      { label: "Vocabulary & Collocations Kit", href: "/courses/celpip-vocabulary-collocations-kit" },
      { label: "Vocabulary Foundations", href: "/courses/celpip-vocabulary-foundations" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "CELPIP Teacher", href: "/learn" },
      { label: "CELPIP Study Materials", href: "/learn" },
      { label: "Student Reviews", href: "/reviews" },
      { label: "Writing & Speaking Templates", href: "/learn/templates" },
      { label: "Vocabulary Builder", href: "/courses/celpip-vocabulary-foundations" },
    ],
  },
  {
    title: "About Shilu",
    links: [
      { label: "CELPIP vs IELTS", href: "/lp/celpip-vs-ielts" },
      { label: "Compare CELPIP Platforms", href: "/compare/celpip-practice-platforms" },
      { label: "CELPIP for Immigration", href: "/lp/celpip-for-canadian-immigration" },
      { label: "IELTS Preparation", href: "https://ielts-prep.ai" },
    ],
  },
];

export const listeningParts = [
  "Listening Problem Solving",
  "Daily Life Conversation",
  "Information",
  "News Item",
  "Discussion",
  "Viewpoints",
];

export const readingParts = [
  "Reading Correspondence",
  "Apply a Diagram",
  "Information",
  "Viewpoints",
];

export const writingParts = ["Writing an Email", "Survey Questions"];

export const speakingParts = [
  "Giving Advice",
  "Personal Experience",
  "Describing a Scene",
  "Making Predictions",
  "Comparing and Persuading",
  "Difficult Situation",
  "Expressing Opinions",
  "Unusual Situation",
];

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */
export const steps = [
  {
    step: "01",
    title: "Pick a skill or take a mock exam",
    description:
      "Start with a full timed mock to see where you stand, or jump straight into the skill you want to improve.",
  },
  {
    step: "02",
    title: "Practice and get instant AI scoring",
    description:
      "Answer exam-style questions and receive instant scores plus natural, rubric-aligned feedback on Speaking and Writing.",
  },
  {
    step: "03",
    title: "Review feedback and track progress",
    description:
      "Learn from every explanation, apply your AI feedback, and watch your estimated CLB level climb toward 10+.",
  },
];
