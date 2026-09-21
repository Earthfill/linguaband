import type { SpeakingTask } from "./types";

export const speakingTasks: SpeakingTask[] = [
  {
    id: "spk-01",
    title: "Task 1: Giving Advice",
    scenario:
      "Your friend Maya is feeling overwhelmed at a new job and has mentioned how difficult it is to stay organized. What advice would you give Maya?",
    prepTimeSec: 30,
    speakTimeSec: 60,
    tips: [
      "Give two or three concrete pieces of advice, not general statements.",
      "Open with a sympathetic phrase, then move into advice naturally.",
      "Explain why each piece of advice will help, using a short example.",
      "End with an encouraging closing line.",
    ],
    sampleAnswer:
      "That is a really tough position to be in, so I completely understand why you feel overwhelmed. First, I would suggest writing down every task at the start of each day and putting the most urgent one at the top. When you have ten items in your head, nothing feels possible, but seeing just one clear priority helps you focus, and I have always found that it reduces that panicky feeling. Second, try blocking out small windows of quiet time — maybe twenty minutes in the morning — with your phone on silent. In my experience, people do their best work during those short, focused blocks rather than trying to multitask all day. Finally, do not be afraid to ask your manager which projects can wait until next week, because most bosses would rather you communicate early than submit rushed work. If you try these three things for two weeks, I am confident you will feel much more in control.",
    clb: "CLB 9 sample",
  },
  {
    id: "spk-02",
    title: "Task 2: Personal Experience",
    scenario:
      "Describe a time when you helped a friend or family member solve a problem. What was the situation, and what did you do?",
    prepTimeSec: 30,
    speakTimeSec: 60,
    tips: [
      "Use a clear story arc: situation → action → outcome.",
      "Include one specific detail to make the story vivid.",
      "Keep the answer at a natural pace; do not rush the ending.",
      "Finish with a one-line reflection on what you learned.",
    ],
    sampleAnswer:
      "Let me tell you about last winter, when my younger cousin was struggling to prepare for her driving test. She had failed once already, and she kept making the same mistakes during parallel parking, so a week before her second attempt I offered to help. Every evening after work, we went to the nearly empty mall parking lot, set up two shopping carts as pylons, and practised the exact manoeuvre until she could do it without checking her mirrors constantly. On the weekend, I took her onto the quieter streets near the river so she could get used to real traffic too. In the end, not only did she pass, but she scored perfectly on the parking section, and the best part was seeing how much her confidence had grown. That experience reminded me that a patient, structured helper can make a bigger difference than simply telling someone to try harder.",
    clb: "CLB 10 sample",
  },
  {
    id: "spk-03",
    title: "Task 3: Describing a Scene",
    scenario:
      "Describe a busy farmers' market you went to in the summer. What could you see, hear, and smell?",
    prepTimeSec: 30,
    speakTimeSec: 60,
    tips: [
      "Structure by senses: what you saw, heard, smelled, and felt.",
      "Mention people's actions, not just objects, to keep it dynamic.",
      "Use location words like 'towards the back' or 'near the entrance'.",
      "Close with an overall impression of the atmosphere.",
    ],
    sampleAnswer:
      "The last farmers' market I went to was held every Saturday in the park near my apartment, and it was one of the liveliest scenes I have seen in a long time. Near the entrance, rows of white tents stretched down the main path, and underneath them farmers were stacking ripe peaches and boxes of bright tomatoes while calling out prices to the crowd. I could hear soft jazz from a small stage near the fountain, mixed with the constant clinking of coffee cups and the squeak of bicycle brakes. The smells were unforgettable: fresh bread drifting from the bakery stall, spiced sausage from a grill further back, and cut flowers that seemed to sharpen the air near the south gate. As I walked towards the far end, I passed children sitting cross-legged on the grass peeling oranges, and parents with stuffed canvas bags heading home. For me, that chaotic, colourful scene summed up the whole season — it felt alive, friendly, and full of small pleasures.",
    clb: "CLB 9 sample",
  },
];
