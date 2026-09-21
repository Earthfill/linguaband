import type { WritingTask } from "./types";

export const writingTasks: WritingTask[] = [
  {
    id: "wr-01",
    task: "Writing Task 1",
    title: "Writing an Email",
    timeLimit: "27 min",
    wordTarget: "150–200 words",
    scenario:
      "You recently ordered a pair of running shoes from the online store RunFast. When the package arrived, the shoes were the wrong size. You must write an email to the customer support team about the problem.\n\nYour email should include:\n• Your order details\n• A clear description of the problem\n• What you would like the support team to do",
    instructions: [
      "Address the email appropriately in the opening salutation.",
      "State the reason for writing early in the first paragraph.",
      "Give enough detail so the recipient can find your order.",
      "Close politely with a clear request.",
    ],
    sampleAnswer:
      "Subject: Wrong size order — RUN-88421\n\nDear RunFast Support Team,\n\nI am writing to let you know that the running shoes I ordered on September 12 did not arrive in the size I requested.\n\nMy order number is RUN-88421, and I ordered the AirFlex 6 in size 10.5. However, when I opened the package yesterday, the box contained a size 9.5. I double-checked the packing slip, which also lists size 9.5, so the error appears to have happened during packing.\n\nI would appreciate it if you could arrange a replacement in size 10.5 at no extra cost. If that model is no longer available, I would be happy to exchange it for a similar pair of the same value. Please let me know how you would like to proceed and whether I should return the incorrect pair.\n\nThank you for your help, and I look forward to your reply.\n\nBest regards,\nSamira Noori",
    criteria: [
      { label: "Content", note: "Covers all three bullet points naturally and specifically." },
      { label: "Cohesion", note: "Paragraphs flow logically from reason → problem → request." },
      { label: "Word choice", note: "Formal but natural business phrases used accurately." },
      { label: "Grammar & tone", note: "Polite tone with correct sentence boundaries and register." },
    ],
  },
  {
    id: "wr-02",
    task: "Writing Task 2",
    title: "Responding to Survey Questions",
    timeLimit: "26 min",
    wordTarget: "150–200 words",
    scenario:
      "A community centre is planning its weekend program for the coming season. You received a survey with two questions.\n\nQuestion 1: What is the most useful additional class the community centre could offer?\n\nQuestion 2: If the centre added free evening language classes, what is the best time of day for them?",
    instructions: [
      "Answer both questions fully in one response of 150–200 words.",
      "Give a clear opinion for each question with a reason and an example.",
      "Use paragraph breaks so each question is addressed clearly.",
      "Keep the tone friendly and semi-formal, as if writing to staff.",
    ],
    sampleAnswer:
      "Dear Community Centre Team,\n\nThank you for asking residents what they would like to see in the new weekend program.\n\nIn my view, the most useful class the centre could add is a weekly evening workshop on financial planning. Many people I know — including young families in this neighbourhood — struggle with budgeting and saving for big purchases. A practical class led by a local credit counsellor would give participants tools they could use immediately, just like the cooking classes the centre already runs.\n\nFor the second question, I would recommend holding the free evening language classes from 6:30 to 8:00 p.m. This timing works for people who finish work at five and need to commute home first, while still leaving the evening free. Weekdays rather than weekends would make it easier for parents to attend, as many already use Saturdays for errands and family activities.\n\nThank you again for collecting feedback. I hope these suggestions are useful for the next season.\n\nSincerely,\nMarcus Chan",
    criteria: [
      { label: "Content", note: "Both survey questions answered clearly with reasons." },
      { label: "Organization", note: "Clear paragraphs for each question with a polite frame." },
      { label: "Vocabulary", note: "Range of linking words and topic-specific terms." },
      { label: "Length control", note: "Stays inside the 150–200 word target." },
    ],
  },
];
