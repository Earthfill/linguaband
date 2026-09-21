import type { MockSection, SpeakingTask } from "../types";

function speakingSection(id: string, title: string, task: SpeakingTask, prep: number, speak: number): MockSection {
  return {
    id,
    skill: "speaking",
    title,
    instructions: "Prepare silently, then speak your full answer aloud.",
    timeLimitSec: prep + speak,
    questions: [],
    speakingTask: { ...task, prepTimeSec: prep, speakTimeSec: speak },
  };
}

const s1: SpeakingTask = {
  id: "M1S1",
  title: "Task 1: Giving Advice",
  scenario: "Your friend Maya is feeling overwhelmed at her new job and has said she is finding it hard to stay organized. What advice would you give Maya?",
  prepTimeSec: 30,
  speakTimeSec: 60,
  tips: [
    "Give two or three concrete pieces of advice, not general statements.",
    "Open with a sympathetic phrase, then move into advice naturally.",
    "Explain why each piece of advice will help, using a short example.",
    "End with an encouraging closing line.",
  ],
  sampleAnswer:
    "That is a really tough position to be in, so I completely understand why you feel overwhelmed. First, I would suggest writing down every task at the start of each day and putting the most urgent one at the top. When you have ten things in your head, nothing feels possible, but seeing one clear priority helps you focus, and I have always found that reduces the panic. Second, try blocking out a short quiet window each morning with your phone on silent, because most people do their best work in those focused blocks. Finally, don't be afraid to ask your manager which projects can wait until next week. If you try these three things for two weeks, I'm confident you'll feel much more in control.",
  clb: "CLB 9 sample",
};

const s2: SpeakingTask = {
  id: "M1S2",
  title: "Task 2: Talking about a Personal Experience",
  scenario: "Describe a time when you helped a friend or family member solve a problem. What was the situation, and what did you do?",
  prepTimeSec: 30,
  speakTimeSec: 60,
  tips: [
    "Use a clear story arc: situation → action → outcome.",
    "Include one specific detail to make the story vivid.",
    "Keep the answer at a natural pace; do not rush the ending.",
    "Finish with a one-line reflection on what you learned.",
  ],
  sampleAnswer:
    "Let me tell you about last winter, when my younger cousin was struggling to pass her driving test. She had failed once, and she kept making the same mistakes during parallel parking, so a week before her second attempt I offered to help. Every evening after work, we went to the nearly empty mall parking lot, set up two shopping carts as pylons, and practised the manoeuvre until she could do it without checking her mirrors constantly. On the weekend I took her onto quieter streets near the river so she could get used to real traffic. In the end she passed, and the best part was seeing how much her confidence had grown. That experience reminded me that a patient, structured helper can make a bigger difference than simply telling someone to try harder.",
  clb: "CLB 10 sample",
};

const S1 = speakingSection("S1", "Speaking Task 1 · Giving Advice", s1, 30, 60);
const S2 = speakingSection("S2", "Speaking Task 2 · Personal Experience", s2, 30, 60);

const s3: SpeakingTask = {
  id: "M1S3",
  title: "Task 3: Describing a Scene",
  scenario: "Describe a busy farmers' market you went to in the summer. What could you see, hear, and smell?",
  prepTimeSec: 30,
  speakTimeSec: 60,
  tips: [
    "Structure by senses: what you saw, heard, smelled, and felt.",
    "Mention people's actions, not just objects, to keep it dynamic.",
    "Use location words like 'towards the back' or 'near the entrance'.",
    "Close with an overall impression of the atmosphere.",
  ],
  sampleAnswer:
    "The last farmers' market I went to was held every Saturday in the park near my apartment, and it was one of the liveliest scenes I have seen. Near the entrance, rows of white tents stretched down the main path, and farmers were stacking ripe peaches and boxes of bright tomatoes while calling out prices to the crowd. I could hear soft jazz from a small stage near the fountain, mixed with the clinking of coffee cups and the squeak of bicycle brakes. The smells were unforgettable: fresh bread from the bakery stall, spiced sausage from a grill further back, and cut flowers that sharpened the air near the south gate. As I walked toward the far end, I passed children sitting on the grass peeling oranges and parents with stuffed canvas bags heading home. It felt alive, friendly, and full of small pleasures.",
  clb: "CLB 9 sample",
};

const s4: SpeakingTask = {
  id: "M1S4",
  title: "Task 4: Making Predictions",
  scenario: "A group of cyclists is approaching a flooded section of a park trail after a heavy storm. What do you think will happen next?",
  prepTimeSec: 30,
  speakTimeSec: 60,
  tips: [
    "Describe the likely sequence of events step by step.",
    "Use phrases like 'I imagine', 'probably', and 'it's likely that'.",
    "Explain what the people might say or feel, not just what they do.",
    "Offer two possible outcomes: the cautious one and the risky one.",
  ],
  sampleAnswer:
    "I imagine that as the cyclists get closer, the ones in front will slow down and put their feet down to judge how deep the water is. One of them will probably point toward a drier path through the grass on the right, while another, maybe the younger one, will say he can ride straight through. I think the cautious riders will choose to walk their bikes along the grass, but the confident one might try to pedal through and end up splashing water everywhere. If the water is deeper than it looks, he will likely get stuck halfway and have to push his bike out, while the others laugh and call him over. Most likely, in the end, the whole group will decide the flooded section is not worth the risk and take the longer way around.",
  clb: "CLB 9 sample",
};

const S3 = speakingSection("S3", "Speaking Task 3 · Describing a Scene", s3, 30, 60);
const S4 = speakingSection("S4", "Speaking Task 4 · Making Predictions", s4, 30, 60);

const s5: SpeakingTask = {
  id: "M1S5",
  title: "Task 5: Comparing and Persuading",
  scenario: "Your friend is deciding between buying a car and joining a car-share service. Compare the two options and persuade them to choose one.",
  prepTimeSec: 30,
  speakTimeSec: 60,
  tips: [
    "Present both options fairly before giving your recommendation.",
    "Use a clear 'on the one hand / on the other hand' structure.",
    "Support your recommendation with a personal example.",
    "End by restating which option you think is best.",
  ],
  sampleAnswer:
    "On the one hand, owning a car gives you total freedom — you can leave whenever you want, keep things in the trunk, and you never have to check availability. On the other hand, owning means paying for insurance, maintenance, parking and fuel every single month, even on days you never drive. A car-share service is much cheaper if you only need a car once or twice a week, because you pay only for the time you use. In my experience, I sold my car two years ago and joined a car-share, and I have saved hundreds of dollars a month. I would recommend the car-share service, because unless you drive every day, the convenience of ownership simply is not worth the cost.",
  clb: "CLB 9 sample",
};

const s6: SpeakingTask = {
  id: "M1S6",
  title: "Task 6: Dealing with a Difficult Situation",
  scenario: "Your neighbour has been playing loud music late at night, and it is keeping you awake. Explain how you would deal with the situation.",
  prepTimeSec: 30,
  speakTimeSec: 60,
  tips: [
    "Describe a calm, step-by-step approach rather than an emotional reaction.",
    "Start with a polite conversation before escalating.",
    "Explain what you would do if the behaviour continued.",
    "Keep the tone reasonable and neighbourly.",
  ],
  sampleAnswer:
    "I would handle this calmly, because getting angry rarely solves anything with neighbours. First, I would wait until the next day and knock on their door during the afternoon, when everyone is calmer. I would introduce myself politely, explain that the music travels through the wall late at night, and ask if they could lower it after, say, eleven o'clock. I would frame it as a friendly request, not an accusation. If the noise continued, I would leave a short, polite note, and if it still did not stop, I would mention it to the building manager or landlord rather than calling the police right away. The goal is to solve the problem while keeping a good relationship.",
  clb: "CLB 8 sample",
};

const S5 = speakingSection("S5", "Speaking Task 5 · Comparing and Persuading", s5, 30, 60);
const S6 = speakingSection("S6", "Speaking Task 6 · Difficult Situation", s6, 30, 60);

const s7: SpeakingTask = {
  id: "M1S7",
  title: "Task 7: Expressing Opinions",
  scenario: "Some people believe children should not be given a smartphone until they are fourteen years old. What is your opinion?",
  prepTimeSec: 30,
  speakTimeSec: 60,
  tips: [
    "State your opinion clearly in the first sentence.",
    "Give two or three reasons with a short example each.",
    "Acknowledge the other side briefly to sound balanced.",
    "End by restating your position in one sentence.",
  ],
  sampleAnswer:
    "I agree with the idea, although I would set the limit a little lower, at around twelve. The main reason is that smartphones give children unlimited access to social media before they have the judgement to handle it, and that can affect both their sleep and their confidence. Second, many children use phones as a way to avoid real-life interaction, and I think those face-to-face skills are built best in the early years. That said, I understand why parents want to reach their children, and a simple call-and-text phone without internet is a sensible middle ground. Overall, I believe delaying the full smartphone until the early teens is the right call.",
  clb: "CLB 9 sample",
};

const s8: SpeakingTask = {
  id: "M1S8",
  title: "Task 8: Describing an Unusual Situation",
  scenario: "You are at a family dinner when a relative suddenly and loudly criticises the career you have chosen. What would you say and do?",
  prepTimeSec: 30,
  speakTimeSec: 60,
  tips: [
    "Describe how you would stay calm and not argue back.",
    "Explain what you would say to acknowledge the criticism politely.",
    "Show how you would steer the conversation in a positive direction.",
    "End by describing how you would keep the family meal pleasant.",
  ],
  sampleAnswer:
    "I would not react defensively, because answering anger with anger would only ruin the dinner for everyone. First, I would take a slow breath and give a small smile, then I would say something like, 'I appreciate that you're worried about my future, but this is a path I've thought about carefully and I'm really happy in it.' I would keep my voice calm and friendly so the conversation does not turn into an argument. Then I would try to move things forward by asking about their work or changing the subject to something we both enjoy, like the meal or a family memory. After dinner, if the tension remained, I might have a quiet one-on-one word with them, but the main goal is to keep the evening pleasant for everyone.",
  clb: "CLB 10 sample",
};

const S7 = speakingSection("S7", "Speaking Task 7 · Expressing Opinions", s7, 30, 60);
const S8 = speakingSection("S8", "Speaking Task 8 · Unusual Situation", s8, 30, 60);

export const mock01Speaking: MockSection[] = [S1, S2, S3, S4, S5, S6, S7, S8];


