import type { MockSection, PracticeQuestion } from "../types";

const q = (
  id: string,
  part: string,
  question: string,
  options: string[],
  answerIndex: number,
  explanation: string,
): PracticeQuestion => ({ id, label: "Question", part, question, options, answerIndex, explanation });

// ---- Part 1 · Problem Solving (8 questions) ----
const L1: MockSection = {
  id: "L1",
  skill: "listening",
  title: "Part 1 · Listening to Problem Solving",
  instructions: "Listen to the phone call. Answer each question by choosing the best option.",
  timeLimitSec: 360,
  passageTitle: "Customer service call",
  passage:
    "AGENT: Halton Home Services, this is Priya. How may I help you?\nCUSTOMER: Hi — I've got water coming through the ceiling of my kitchen from the bathroom upstairs.\nAGENT: I'm sorry to hear that. Have you turned off the water at the main valve?\nCUSTOMER: Not yet — I wasn't sure where it is.\nAGENT: It's usually in the basement near the front wall. I'd turn it off right away to stop further damage.\nCUSTOMER: Okay, I'll do that now. How soon can someone come?\nAGENT: We have a plumber finishing a job in your area. He can be there within the hour.\nCUSTOMER: That's fine. What's the cost?\nAGENT: There's a standard call-out fee of eighty dollars, covering the first thirty minutes. After that it's billed per fifteen-minute block at twenty-five dollars. Parts are extra, but we'll confirm any cost before starting repairs.\nCUSTOMER: Great — please send someone over.",
  questions: [
    q("L1Q1", "Part 1 · Problem Solving", "Why did the customer call?", ["A sink is blocked", "Water is leaking through the ceiling", "The heating has stopped working", "A window will not close"], 1, "The caller says water is 'coming through the ceiling of my kitchen' from the bathroom above."),
    q("L1Q2", "Part 1 · Problem Solving", "What is the customer advised to do first?", ["Open a window", "Turn off the main water valve", "Move the furniture upstairs", "Call an electrician"], 1, "The agent recommends turning off the water 'right away' to stop further damage."),
    q("L1Q3", "Part 1 · Problem Solving", "Where is the main valve located?", ["In the kitchen", "Beside the front door", "In the basement near the front wall", "Under the bathroom sink"], 2, "The agent says it is 'usually in the basement near the front wall'."),
    q("L1Q4", "Part 1 · Problem Solving", "How soon can a plumber arrive?", ["Within the hour", "Tomorrow morning", "In three days", "Within fifteen minutes"], 0, "The plumber 'can be there within the hour'."),
    q("L1Q5", "Part 1 · Problem Solving", "What does the eighty-dollar fee cover?", ["The full repair", "Travel only", "The first thirty minutes", "Parts and labour"], 2, "The call-out fee 'covers the first thirty minutes'."),
    q("L1Q6", "Part 1 · Problem Solving", "How is time billed after the first thirty minutes?", ["Per hour", "Per fifteen-minute block", "A flat fifty dollars", "It is free"], 1, "Time is 'billed per fifteen-minute block at twenty-five dollars'."),
    q("L1Q7", "Part 1 · Problem Solving", "What does the agent say about parts?", ["They are free", "The cost is confirmed before repairs", "The customer must buy them first", "They are not available today"], 1, "Parts are extra but 'we'll confirm any cost before starting repairs'."),
    q("L1Q8", "Part 1 · Problem Solving", "What does the customer decide to do?", ["Fix it himself", "Wait until the weekend", "Send someone over", "Ask for a refund"], 2, "The caller ends with 'please send someone over'."),
  ],
};

// ---- Part 2 · Daily Life Conversation (5 questions) ----
const L2: MockSection = {
  id: "L2",
  skill: "listening",
  title: "Part 2 · Listening to a Daily Life Conversation",
  instructions: "Listen to two friends planning their weekend. Choose the best answer for each question.",
  timeLimitSec: 300,
  passageTitle: "Weekend plans",
  passage:
    "LEE: You look tired. Long week?\nMARA: Tell me about it. I've been working late every night because of a project deadline.\nLEE: Well, the good news is the weather's supposed to be beautiful this weekend.\nMARA: Really? I was thinking of finally checking out that new trail by the river.\nLEE: I did it last Saturday — it's about six kilometres, mostly flat, and there's a little cafe at the halfway point.\nMARA: That sounds perfect. Are you free on Sunday morning?\nLEE: I have a dentist appointment at nine, but I could meet you around eleven.\nMARA: Eleven works. Should we drive separately or meet at the trailhead?\nLEE: The parking lot fills up early, so I'll pick you up at ten forty-five.\nMARA: Great — I'll bring water and a hat.",
  questions: [
    q("L2Q1", "Part 2 · Daily Life Conversation", "Why has Mara been tired?", ["She has been travelling", "She has been working late", "She has been unwell", "She has been exercising too much"], 1, "Mara says she has been 'working late every night' for a project."),
    q("L2Q2", "Part 2 · Daily Life Conversation", "What does Lee say about the weekend weather?", ["It will rain", "It will be cold", "It will be beautiful", "It will be windy"], 2, "Lee says the weather is 'supposed to be beautiful'."),
    q("L2Q3", "Part 2 · Daily Life Conversation", "What did Lee say about the trail?", ["It is steep and difficult", "It is six kilometres and mostly flat", "It is closed this weekend", "It is far from the river"], 1, "The trail is 'about six kilometres, mostly flat' with a cafe at the halfway point."),
    q("L2Q4", "Part 2 · Daily Life Conversation", "When will they meet?", ["Saturday at nine", "Sunday around eleven", "Sunday at nine", "Saturday at eleven"], 1, "Lee can meet 'around eleven' on Sunday after a dentist appointment at nine."),
    q("L2Q5", "Part 2 · Daily Life Conversation", "How will they get to the trail?", ["They will drive separately", "Lee will pick Mara up", "They will take the bus", "Mara will drive"], 1, "Lee offers to 'pick you up at ten forty-five'."),
  ],
};

// ---- Part 3 · Listening for Information (6 questions) ----
const L3: MockSection = {
  id: "L3",
  skill: "listening",
  title: "Part 3 · Listening for Information",
  instructions: "Listen to a library announcement. Choose the best answer for each question.",
  timeLimitSec: 360,
  passageTitle: "Library program launch",
  passage:
    "ANNOUNCER: Welcome to the Riverside Public Library's fall program launch. Starting October first, we're introducing three new services. First, an extended Saturday storytime for children aged three to six, running from ten to eleven in the community room. Second, a free digital-skills help desk every Tuesday and Thursday afternoon, where volunteers can assist with phones, tablets and laptops — no appointment needed. Third, a home-delivery service for cardholders who cannot visit the library in person; deliveries go out every second Wednesday and can be arranged by phone or through our website. All three services are free, but storytime and home delivery require registration in advance. Registration opens this Friday at nine a.m. at the front desk and online.",
  questions: [
    q("L3Q1", "Part 3 · Listening for Information", "What is the announcement mainly about?", ["New library services for fall", "Changes to opening hours", "A book sale", "Library job openings"], 0, "The talk introduces 'three new services' for the library's fall program."),
    q("L3Q2", "Part 3 · Listening for Information", "Who is the Saturday storytime for?", ["Teenagers", "Children aged three to six", "All library members", "New parents only"], 1, "Storytime is 'for children aged three to six'."),
    q("L3Q3", "Part 3 · Listening for Information", "When is the digital-skills help desk available?", ["Monday and Wednesday mornings", "Every day at noon", "Tuesday and Thursday afternoons", "Saturday and Sunday"], 2, "The help desk runs 'every Tuesday and Thursday afternoon'."),
    q("L3Q4", "Part 3 · Listening for Information", "Who is the home-delivery service for?", ["People who work full time", "Cardholders who cannot visit in person", "New members only", "Seniors over seventy"], 1, "It is for 'cardholders who cannot visit the library in person'."),
    q("L3Q5", "Part 3 · Listening for Information", "How often do home deliveries go out?", ["Every second Wednesday", "Every Friday", "Twice a week", "Once a month"], 0, "Deliveries go out 'every second Wednesday'."),
    q("L3Q6", "Part 3 · Listening for Information", "What requires advance registration?", ["Storytime and home delivery", "The help desk only", "Nothing — all services are drop-in", "Home delivery only"], 0, "Storytime and home delivery both 'require registration in advance'."),
  ],
};

// ---- Part 4 · News Item (5 questions) ----
const L4: MockSection = {
  id: "L4",
  skill: "listening",
  title: "Part 4 · Listening to a News Item",
  instructions: "Listen to the news item. Choose the best answer for each question.",
  timeLimitSec: 420,
  passageTitle: "City council approves bridge",
  passage:
    "NEWS READER: The city council voted last night to approve funding for a new pedestrian bridge across the Don Valley. The bridge, which will connect the Eastside neighbourhood with the downtown core, is expected to cost eighteen million dollars and take two years to complete. Construction is scheduled to begin next spring, following a final public consultation in December. Supporters say the bridge will cut the current forty-minute walking detour down to just ten minutes and encourage cycling. Opponents argue the money would be better spent repairing existing roads, several of which have been closed since last winter's flooding. The mayor called the decision 'a long-term investment in a greener, more connected city', while acknowledging that some road repairs will be delayed as a result.",
  questions: [
    q("L4Q1", "Part 4 · News Item", "What did the council approve?", ["Funding for a pedestrian bridge", "A new road-widening project", "A public transit fare increase", "A housing development"], 0, "The council voted to 'approve funding for a new pedestrian bridge'."),
    q("L4Q2", "Part 4 · News Item", "How much will the bridge cost?", ["Eight million dollars", "Eighteen million dollars", "Eighty million dollars", "Two million dollars"], 1, "The bridge is expected to cost 'eighteen million dollars'."),
    q("L4Q3", "Part 4 · News Item", "When is construction scheduled to begin?", ["This December", "Next spring", "Next winter", "Within two years"], 1, "Construction is 'scheduled to begin next spring'."),
    q("L4Q4", "Part 4 · News Item", "What benefit do supporters describe?", ["It will create new jobs", "It will cut a 40-minute walk to 10 minutes", "It will reduce road traffic tolls", "It will link two suburbs"], 1, "Supporters say it will cut 'the current forty-minute walking detour down to just ten minutes'."),
    q("L4Q5", "Part 4 · News Item", "What is the main concern of opponents?", ["The bridge is too expensive for cyclists", "The money should go to road repairs", "The bridge will damage the valley", "Construction will take too long"], 1, "Opponents argue the money 'would be better spent repairing existing roads'."),
  ],
};

// ---- Part 5 · Discussion (8 questions) ----
const L5: MockSection = {
  id: "L5",
  skill: "listening",
  title: "Part 5 · Listening to a Discussion",
  instructions: "Listen to a discussion about remote work. Choose the best answer for each question.",
  timeLimitSec: 720,
  passageTitle: "Remote work and our cities",
  passage:
    "HOST: Welcome back. Today we're asking: has the shift to remote work been good for our cities? With me are economist Dr. Elena Roth and small-business owner Marcus Webb. Elena, let's start with you.\nELENA: Thanks. The data shows a clear split. Knowledge workers report higher satisfaction and save commuting costs, but downtown businesses have lost foot traffic — lunch spots and transit have felt it most.\nHOST: Marcus, you run a print shop downtown.\nMARCUS: That's right. Our daytime customers dropped by almost half. But we've adapted — we now offer delivery and early-evening hours, and we've kept everyone employed.\nHOST: Elena, what about the long term?\nELENA: Offices aren't disappearing; they're changing. We're likely to settle on three days in, two days out. That hybrid model spreads demand more evenly and is better for the city's finances than full remote.\nMARCUS: I'd agree with that. A steady three-day week would bring enough people back to keep the lunch economy alive, without losing the flexibility workers now expect.\nHOST: So a middle path, then. Thanks to you both.",
  questions: [
    q("L5Q1", "Part 5 · Discussion", "What is the main topic of the discussion?", ["The cost of downtown parking", "The effects of remote work on cities", "How to run a print shop", "Public transit funding"], 1, "The host frames the question as whether remote work 'has been good for our cities'."),
    q("L5Q2", "Part 5 · Discussion", "What benefit do knowledge workers report, according to Elena?", ["Shorter workdays", "Higher satisfaction and lower commuting costs", "Better salaries", "More vacation time"], 1, "Elena says knowledge workers 'report higher satisfaction and save commuting costs'."),
    q("L5Q3", "Part 5 · Discussion", "Which businesses have felt the impact most?", ["Suburban malls", "Downtown lunch spots and transit", "Online retailers", "Warehouses"], 1, "Downtown 'lunch spots and transit have felt it most', Elena says."),
    q("L5Q4", "Part 5 · Discussion", "How has Marcus's print shop adapted?", ["It moved to the suburbs", "It cut its staff", "It added delivery and evening hours", "It raised its prices"], 2, "Marcus says 'we now offer delivery and early-evening hours'."),
    q("L5Q5", "Part 5 · Discussion", "What did Marcus say about his employees?", ["He had to lay some off", "He kept everyone employed", "He reduced their hours", "He hired more staff"], 1, "Marcus says 'we've kept everyone employed'."),
    q("L5Q6", "Part 5 · Discussion", "What hybrid model does Elena predict?", ["Four days in, one day out", "Two days in, three days out", "Three days in, two days out", "Fully remote forever"], 2, "Elena predicts 'three days in, two days out'."),
    q("L5Q7", "Part 5 · Discussion", "Why does Marcus support the hybrid model?", ["It would keep the lunch economy alive", "It would raise property values", "It would reduce traffic", "It would cut his rent"], 0, "A three-day week 'would bring enough people back to keep the lunch economy alive'."),
    q("L5Q8", "Part 5 · Discussion", "What is the overall conclusion of the discussion?", ["Remote work should be banned", "A middle path of hybrid work is likely", "Offices will close completely", "The city must subsidize transit"], 1, "The host closes with 'so a middle path, then', reflecting the hybrid consensus."),
  ],
};

// ---- Part 6 · Viewpoints (6 questions) ----
const L6: MockSection = {
  id: "L6",
  skill: "listening",
  title: "Part 6 · Listening to Viewpoints",
  instructions: "Listen to two speakers give their views. Choose the best answer for each question.",
  timeLimitSec: 660,
  passageTitle: "E-bikes in city parks",
  passage:
    "SPEAKER A: E-bikes have no place on our park trails. Trails are for walking and traditional cycling, and motor-assisted bikes move too fast for a space meant for families and dogs. I've nearly been clipped twice this month. If we allow e-bikes everywhere, we'll push walkers out of the parks entirely. A speed limit is unenforceable on a narrow path, so the only fair rule is to keep motor power off the trails.\nSPEAKER B: I understand the worry, but a blanket ban ignores who actually rides e-bikes — commuters and older riders who otherwise wouldn't cycle at all. The real issue isn't the motor; it's courtesy. A fifteen-kilometre speed limit, clearly posted, plus fines for reckless riding, would let everyone share the trail safely. We shouldn't punish a whole group for the behaviour of a few.",
  questions: [
    q("L6Q1", "Part 6 · Viewpoints", "What is the topic of the two viewpoints?", ["Whether e-bikes belong on park trails", "The price of bicycles", "New park opening hours", "Road safety for cars"], 0, "Both speakers debate whether e-bikes should be allowed on park trails."),
    q("L6Q2", "Part 6 · Viewpoints", "What is Speaker A's main concern?", ["E-bikes are too expensive", "E-bikes move too fast for shared paths", "E-bikes are too loud", "E-bikes are hard to park"], 1, "Speaker A says e-bikes 'move too fast for a space meant for families and dogs'."),
    q("L6Q3", "Part 6 · Viewpoints", "What does Speaker A say about a speed limit?", ["It would solve everything", "It is unenforceable on a narrow path", "It is too costly", "It already exists"], 1, "Speaker A calls a speed limit 'unenforceable on a narrow path'."),
    q("L6Q4", "Part 6 · Viewpoints", "According to Speaker B, who actually rides e-bikes?", ["Young children", "Commuters and older riders", "Delivery drivers", "Tourists"], 1, "Speaker B says e-bikes are used by 'commuters and older riders who otherwise wouldn't cycle'."),
    q("L6Q5", "Part 6 · Viewpoints", "What solution does Speaker B propose?", ["A complete ban", "Wider trails only", "A posted speed limit plus fines", "Charging a trail fee"], 2, "Speaker B proposes a 'fifteen-kilometre speed limit, clearly posted, plus fines for reckless riding'."),
    q("L6Q6", "Part 6 · Viewpoints", "How do the two speakers mainly differ?", ["On whether to ban or regulate e-bikes", "On whether trails should be paved", "On the price of e-bikes", "On who owns the parks"], 0, "A wants a ban; B wants regulation with a speed limit and fines."),
  ],
};

export const mock01Listening: MockSection[] = [L1, L2, L3, L4, L5, L6];
