import type { ListeningTrack } from "./types";

export const listeningTracks: ListeningTrack[] = [
  {
    id: "lst-01",
    title: "Refund for a damaged laptop charger",
    part: "Part 1 · Problem Solving",
    setting: "Customer service call",
    speaker: "Customer ↔ Agent",
    durationSec: 36,
    trackLabel: "Track 1 · 0:36",
    transcript:
      "AGENT: TechFix support, Maya speaking. How can I help you?\nCUSTOMER: Hi — I bought a laptop charger from your website last week and it arrived already cracked. The cable's frayed near the tip.\nAGENT: I'm sorry about that. Could you share your order number so I can look it up?\nCUSTOMER: Sure, it's 8-3-2-1-7-0-4.\nAGENT: Thanks. I can see the order was placed six days ago. We'll send a replacement free of charge, and you don't need to return the damaged one.\nCUSTOMER: That's great. How long will it take?\nAGENT: Around three to five business days. You'll receive a tracking email shortly.\nCUSTOMER: Perfect, that solves it.",
    questions: [
      {
        id: "lst-01-q1",
        label: "Question 1",
        part: "Part 1 · Problem Solving",
        question: "Why is the customer calling TechFix?",
        options: [
          "To cancel an order they no longer need",
          "To report a charger that arrived damaged",
          "To ask about a missing tracking number",
          "To upgrade their laptop charger model",
        ],
        answerIndex: 1,
        explanation:
          "The customer explains that the charger 'arrived already cracked' and the cable is frayed. An easy keyword to catch: 'damaged charger' rather than 'cancel' or 'upgrade'.",
      },
      {
        id: "lst-01-q2",
        label: "Question 2",
        part: "Part 1 · Problem Solving",
        question: "What does the agent offer to do?",
        options: [
          "Issue a refund and collect the old charger",
          "Repair the charger at the customer's home",
          "Send a free replacement without requiring a return",
          "Place a new order at a discounted price",
        ],
        answerIndex: 2,
        explanation:
          "Maya says 'we'll send a replacement free of charge, and you don't need to return the damaged one.' That matches option C exactly.",
      },
      {
        id: "lst-01-q3",
        label: "Question 3",
        part: "Part 1 · Problem Solving",
        question: "When can the customer expect the replacement?",
        options: [
          "Within 1–2 business days",
          "In 3–5 business days",
          "By the end of the week",
          "The next calendar week",
        ],
        answerIndex: 1,
        explanation:
          "The agent says the replacement will take 'around three to five business days' and that a tracking email will follow.",
      },
    ],
  },
  {
    id: "lst-02",
    title: "Avo Cafe — new menu announcement",
    part: "Part 2 · Daily Life Conversation",
    setting: "Radio announcement",
    speaker: "Announcer",
    durationSec: 31,
    trackLabel: "Track 2 · 0:31",
    transcript:
      "ANNOUNCER: Avo Cafe on Maple Street has just launched its autumn menu. From today until the end of November, every weekday between three and five, you can grab a seasonal drink and any sandwich for nine dollars. The new menu features a pumpkin latte, pear and gorgonzola toastie, and a maple butter brioche. Students who show a valid ID also receive a ten percent discount on bakery items. Visit avocafe.ca to see the full list of ingredients and allergens before you go.",
    questions: [
      {
        id: "lst-02-q1",
        label: "Question 1",
        part: "Part 2 · Daily Life Conversation",
        question: "What is the main purpose of this announcement?",
        options: [
          "To advertise a new seasonal menu",
          "To announce a store location change",
          "To promote a job opening",
          "To report a price increase",
        ],
        answerIndex: 0,
        explanation:
          "The whole clip is built around the 'autumn menu has just launched' announcement — everything else (the deal, the discount) supports that main point.",
      },
      {
        id: "lst-02-q2",
        label: "Question 2",
        part: "Part 2 · Daily Life Conversation",
        question: "When does the weekday special run?",
        options: [
          "Every morning from 8 to 10",
          "Between 3 and 5 p.m. on weekdays",
          "Only on weekends in November",
          "Daily from 12 to 2 p.m.",
        ],
        answerIndex: 1,
        explanation:
          "The announcer says 'every weekday between three and five' you can get a drink and a sandwich for nine dollars.",
      },
      {
        id: "lst-02-q3",
        label: "Question 3",
        part: "Part 2 · Daily Life Conversation",
        question: "What discount is available to students?",
        options: [
          "Nine dollars off any seasonal drink",
          "Free sandwich with any purchase",
          "10% off bakery items",
          "Buy one get one free on lattes",
        ],
        answerIndex: 2,
        explanation:
          "Listen for the conditional: 'Students who show a valid ID also receive a ten percent discount on bakery items.'",
      },
    ],
  },
];
