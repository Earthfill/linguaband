export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
};

export const navigation: NavItem[] = [
  {
    label: "Practice",
    href: "/questions",
    children: [
      { label: "Mock Exams", href: "/exams", description: "Full-length timed mock tests" },
      { label: "Test Practice", href: "/questions", description: "4,000+ exam-style questions" },
      { label: "Question Bank", href: "/questions", description: "Search every question" },
      { label: "Listening Practice", href: "/listening" },
      { label: "Reading Practice", href: "/reading" },
      { label: "Writing Practice", href: "/writing" },
      { label: "Speaking Practice", href: "/speaking" },
    ],
  },
  {
    label: "Courses",
    href: "/courses",
    children: [
      { label: "Writing Course", href: "/courses/celpip-writing" },
      { label: "Speaking Course", href: "/courses/celpip-speaking" },
      { label: "Listening Course", href: "/courses/celpip-listening" },
      { label: "Reading Course", href: "/courses/celpip-reading" },
      { label: "Vocabulary & Collocations Kit", href: "/courses/celpip-vocabulary-collocations-kit" },
      { label: "Vocabulary Foundations", href: "/courses/celpip-vocabulary-foundations" },
    ],
  },
  {
    label: "Templates",
    href: "/learn/templates",
    children: [
      { label: "Speaking Task 1: Giving Advice", href: "/learn/speaking-task-1-template-giving-advice" },
      { label: "Writing Task 1: Email Template", href: "/learn/celpip-writing-task-1-template-writing-an-email" },
      { label: "Writing Task 2: Survey Template", href: "/learn/celpip-writing-task-2-template-responding-to-survey-questions" },
    ],
  },
  { label: "Vocabulary", href: "/courses/celpip-vocabulary-foundations" },
  { label: "Reviews", href: "/reviews" },
  { label: "Pricing", href: "/pricing" },
];
