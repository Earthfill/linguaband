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
  {
    id: "spk-04",
    title: "Task 4: Making Predictions",
    scenario:
      "A group of cyclists is approaching a flooded section of a park trail after a heavy storm. What do you think will happen next?",
    prepTimeSec: 30,
    speakTimeSec: 60,
    tips: [
      "Start with the strongest clue in the scene and explain what it suggests.",
      "Make two or three realistic predictions using phrases such as ‘is likely to’ or ‘may decide to.’",
      "Connect each prediction to a visible detail instead of guessing without support.",
      "Finish by summarizing the most likely outcome.",
    ],
    sampleAnswer:
      "The cyclists will probably slow down as soon as they notice the flooded path. Since the water may be too deep to cross safely, I think the person in front will signal the others to stop. They might then look for a nearby detour or check a map on their phones. If there is no alternate route, they will likely turn around and use a different trail. The dark, wet conditions also suggest that they will be extra careful, because riding through water could hide potholes or loose branches. Overall, I expect them to avoid the flooded section rather than risk an accident.",
    clb: "CLB 9 sample",
  },
  {
    id: "spk-05",
    title: "Task 5: Comparing and Persuading",
    scenario:
      "Your friend is deciding between buying a car and joining a car-share service. Compare the two options and persuade them to choose one.",
    prepTimeSec: 30,
    speakTimeSec: 60,
    tips: [
      "Name both options and compare them using the listener’s priorities.",
      "Make your recommendation early so your response has a clear direction.",
      "Give two specific benefits of your preferred option and acknowledge one trade-off.",
      "End with a direct, friendly call to action.",
    ],
    sampleAnswer:
      "I know you are choosing between buying a car and joining a car-share service. Owning a car gives you more freedom, but it also means paying for insurance, maintenance, and parking every month. Since you only need to drive a few times a week, I would recommend car sharing. You would have access to a vehicle when you need one without taking on all the costs of ownership. It is also convenient because you can choose a vehicle that suits each trip. The only drawback is that you need to reserve it in advance, but planning a little ahead is much cheaper than keeping a car parked most of the week. I think you should try the service for a month and see how well it fits your routine.",
    clb: "CLB 9 sample",
  },
  {
    id: "spk-06",
    title: "Task 6: Difficult Situation",
    scenario:
      "Your neighbour has been playing loud music late at night, and it is keeping you awake. Explain how you would deal with the situation.",
    prepTimeSec: 30,
    speakTimeSec: 60,
    tips: [
      "Explain the issue calmly and avoid blaming or escalating the conflict.",
      "Describe the first respectful step you would take and what you would say.",
      "Offer a reasonable solution and explain what you would do if the problem continued.",
      "Close by emphasizing a fair outcome for everyone involved.",
    ],
    sampleAnswer:
      "First, I would speak to my neighbour at a reasonable time, rather than confronting them late at night when emotions might be high. I would politely explain that the music has been keeping me awake and ask whether they could lower the volume after ten o’clock. They may not realize how clearly the sound carries into my apartment. If the problem continued, I would keep a brief record of the dates and times and contact the building manager to ask about the quiet-hours policy. I would try to resolve it directly first, because maintaining a respectful relationship with a neighbour is important. Hopefully, a friendly conversation would solve the problem for both of us.",
    clb: "CLB 9 sample",
  },
  {
    id: "spk-07",
    title: "Task 7: Expressing Opinions",
    scenario:
      "Some people believe children should not be given a smartphone until they are fourteen years old. What is your opinion?",
    prepTimeSec: 30,
    speakTimeSec: 60,
    tips: [
      "State your position clearly in the opening sentence.",
      "Support it with two distinct reasons instead of repeating the same point.",
      "Use a brief example to show how your reasons apply in real life.",
      "Recognize a reasonable opposing concern, then restate your conclusion.",
    ],
    sampleAnswer:
      "I agree that children should generally wait until around fourteen before having their own smartphone. At a younger age, it can be difficult to manage screen time, and constant notifications may distract children from homework or sleep. Waiting also gives parents time to teach online safety and responsible communication before a child has unrestricted access to apps. For example, a younger student may benefit from a basic phone for emergencies without needing social media on the same device. Of course, every child is different, so families should consider maturity and practical needs. Overall, though, I think delaying a full smartphone and setting clear rules is a sensible approach.",
    clb: "CLB 9 sample",
  },
  {
    id: "spk-08",
    title: "Task 8: Unusual Situation",
    scenario:
      "You are at a family dinner when a relative suddenly and loudly criticises the career you have chosen. What would you say and do?",
    prepTimeSec: 30,
    speakTimeSec: 60,
    tips: [
      "React to the unexpected moment without sounding hostile or defensive.",
      "Briefly acknowledge the other person, then explain your perspective calmly.",
      "Set a polite boundary or redirect the conversation if the criticism continues.",
      "End with a constructive next step that helps preserve the relationship.",
    ],
    sampleAnswer:
      "I would try to stay calm and avoid responding angrily, especially because we are at a family dinner. I might say, ‘I understand that you have concerns, but I have thought carefully about this career and it is a good fit for me.’ Then I would briefly explain what I enjoy about the work and the goals I am pursuing. If my relative continued criticizing me, I would politely suggest discussing it another time so we could enjoy the meal together. I would also be willing to talk privately later and hear their concerns, as long as the conversation remained respectful. That way, I could stand up for my decision without turning the evening into an argument.",
    clb: "CLB 9 sample",
  },
];
