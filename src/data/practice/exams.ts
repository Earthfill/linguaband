import type { MockExam } from "./types";
import { mock01 } from "./mock01";

export const mockExams: MockExam[] = [
  mock01,
  {
    id: "mock-02",
    name: "Mock Test 02",
    badge: "Timed",
    difficulty: "Standard",
    description: "Fresh question set with the same structure — ideal for a second full attempt.",
    sections: [],
  },
  {
    id: "mock-03",
    name: "Mock Test 03",
    badge: "Challenging",
    difficulty: "Challenging",
    description: "Slightly harder passages and questions to stretch candidates aiming for CLB 9+.",
    sections: [],
  },
  {
    id: "mock-04",
    name: "Listening + Reading Combo",
    badge: "Half exam",
    difficulty: "Standard",
    description: "Build section stamina without the full-day time commitment.",
    sections: [],
  },
  {
    id: "mock-05",
    name: "Writing + Speaking Combo",
    badge: "Half exam",
    difficulty: "Standard",
    description: "Targets the two AI-scored sections with feedback on every response.",
    sections: [],
  },
  {
    id: "mock-06",
    name: "Rapid Review Pack",
    badge: "On the go",
    difficulty: "Standard",
    description: "Quick daily drills to keep exam-ready between full mock tests.",
    sections: [],
  },
];

export const speakingOverview = [
  { title: "Task 1: Giving Advice", desc: "Advise a friend who describes a problem.", icon: "message" },
  { title: "Task 2: Personal Experience", desc: "Tell a short story from your own life.", icon: "user" },
  { title: "Task 3: Describing a Scene", desc: "Describe a picture using all the senses.", icon: "camera" },
  { title: "Task 4: Making Predictions", desc: "Predict what happens next in a scene.", icon: "bulb" },
  { title: "Task 5: Comparing & Persuading", desc: "Compare two options and persuade.", icon: "bar-chart" },
  { title: "Task 6: Difficult Situation", desc: "Explain how you would handle a tricky issue.", icon: "shield" },
  { title: "Task 7: Expressing Opinions", desc: "State and defend your opinion clearly.", icon: "target" },
  { title: "Task 8: Unusual Situation", desc: "React sensibly to an unexpected scenario.", icon: "sparkles" },
];
