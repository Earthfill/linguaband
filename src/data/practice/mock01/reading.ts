import type { MockSection, PracticeQuestion } from "../types";

const q = (
  id: string,
  part: string,
  question: string,
  options: string[],
  answerIndex: number,
  explanation: string,
): PracticeQuestion => ({ id, label: "Question", part, question, options, answerIndex, explanation });

// ---- Part 1 · Reading Correspondence (11 questions) ----
const R1: MockSection = {
  id: "R1",
  skill: "reading",
  title: "Part 1 · Reading Correspondence",
  instructions: "Read the email, then answer the questions that follow.",
  timeLimitSec: 720,
  passageTitle: "Scheduled water shutdown and amenity booking update",
  passage:
    "Subject: Scheduled water shutdown and amenity booking update\n\nDear Residents of Maple Court,\n\nPlease read this notice carefully, as two changes take effect on Monday, March 3.\n\nFirst, the building's main water supply will be shut off on Tuesday, March 4, from 9:00 a.m. to 3:00 p.m. so a contractor can replace a faulty valve on the fourth floor. During this time, no taps, toilets, or laundry machines will work in any unit. We recommend filling a few containers with drinking water the night before. The shutdown will not affect the building's fire-suppression system.\n\nSecond, from March 3, the party room and the rooftop terrace must be booked through the new online portal at maplecourt.ca/bookings. Walk-in use will no longer be possible. Bookings open one week in advance, are limited to two hours per household per day, and require a fifty-dollar refundable deposit paid by credit card. The deposit is returned within five business days if the space is left clean and undamaged.\n\nIf you have questions, contact the management office by email at office@maplecourt.ca before Friday, February 28. Please do not call the superintendent about bookings.\n\nSincerely,\nMaple Court Management",
  questions: [
    q("R1Q1", "Reading Correspondence", "What is the main purpose of this email?", ["To announce a rent increase", "To inform residents of two upcoming changes", "To advertise a vacant unit", "To invite residents to a meeting"], 1, "The email opens by stating that 'two changes take effect on Monday, March 3'."),
    q("R1Q2", "Reading Correspondence", "When will the water be shut off?", ["Monday, March 3, all day", "Tuesday, March 4, from 9 a.m. to 3 p.m.", "Friday, February 28", "Every weekday in March"], 1, "The water is shut off 'on Tuesday, March 4, from 9:00 a.m. to 3:00 p.m.'."),
    q("R1Q3", "Reading Correspondence", "Why is the water being shut off?", ["To clean the water tanks", "To replace a faulty valve on the fourth floor", "To install new laundry machines", "To test the fire system"], 1, "The shutdown allows a contractor to 'replace a faulty valve on the fourth floor'."),
    q("R1Q4", "Reading Correspondence", "What will NOT work during the shutdown?", ["The fire-suppression system", "Taps, toilets, and laundry machines", "The elevators", "The front door intercom"], 1, "During the shutdown 'no taps, toilets, or laundry machines will work'."),
    q("R1Q5", "Reading Correspondence", "What does management recommend residents do?", ["Leave the building for the day", "Fill containers with drinking water the night before", "Call the superintendent", "Cancel all bookings"], 1, "Residents are told to 'fill a few containers with drinking water the night before'."),
    q("R1Q6", "Reading Correspondence", "What is NOT affected by the shutdown?", ["The laundry room", "The fire-suppression system", "The kitchen taps", "The toilets"], 1, "The notice states the shutdown 'will not affect the building's fire-suppression system'."),
    q("R1Q7", "Reading Correspondence", "From March 3, how must the party room be booked?", ["In person at the office", "By calling the superintendent", "Through the new online portal", "By leaving a note on the door"], 2, "The party room and terrace 'must be booked through the new online portal'."),
    q("R1Q8", "Reading Correspondence", "How far in advance do bookings open?", ["One day", "One week", "Two weeks", "One month"], 1, "Bookings 'open one week in advance'."),
    q("R1Q9", "Reading Correspondence", "What is the daily booking limit?", ["One hour per household", "Two hours per household", "Three hours per household", "There is no limit"], 1, "Bookings are 'limited to two hours per household per day'."),
    q("R1Q10", "Reading Correspondence", "What is required to make a booking?", ["A fifty-dollar refundable deposit", "A written application", "A reference letter", "An annual membership fee"], 0, "Bookings 'require a fifty-dollar refundable deposit paid by credit card'."),
    q("R1Q11", "Reading Correspondence", "Who should residents contact with questions?", ["The superintendent, by phone", "The management office, by email", "The contractor", "The building owner"], 1, "Residents should email 'the management office' before February 28."),
  ],
};

// ---- Part 2 · Reading to Apply a Diagram (8 questions) ----
const R2: MockSection = {
  id: "R2",
  skill: "reading",
  title: "Part 2 · Reading to Apply a Diagram",
  instructions: "Read the sorting guide below, then apply the information to answer each question.",
  timeLimitSec: 720,
  passageTitle: "Citywide recycling — what goes where",
  passage:
    "CITYWIDE WASTE SORTING GUIDE\n\nBLUE BIN — recyclable containers (rinse first, no lids):\n• Plastic bottles and tubs\n• Metal cans and foil\n• Glass jars and bottles\n\nGREEN BIN — food and organics (loose, never in a plastic bag):\n• Food scraps and leftovers\n• Coffee grounds and tea bags\n• Paper towels and napkins\n\nBLACK BIN — household garbage:\n• Diapers and pet waste\n• Chip bags and candy wrappers\n• Broken ceramics and old shoes\n\nSPECIAL DROP-OFF — never place these in any bin:\n• Batteries and electronics\n• Paint and household chemicals\n\nCollection is weekly. Bins must be at the curb by 7:00 a.m. and not block the sidewalk. Broken glass should be wrapped in newspaper before it goes in the blue bin.",
  questions: [
    q("R2Q1", "Apply a Diagram", "Where should a rinsed glass jar go?", ["Blue bin", "Green bin", "Black bin", "Special drop-off"], 0, "Glass jars and bottles belong in the blue bin (rinse first)."),
    q("R2Q2", "Apply a Diagram", "Where do coffee grounds belong?", ["Blue bin", "Green bin", "Black bin", "Special drop-off"], 1, "Coffee grounds are listed under the green bin (organics)."),
    q("R2Q3", "Apply a Diagram", "How should food scraps be placed in the green bin?", ["Wrapped in newspaper", "Inside a plastic bag", "Loose, never in a plastic bag", "In a cardboard box"], 2, "Organics go in 'loose, never in a plastic bag'."),
    q("R2Q4", "Apply a Diagram", "Where should a used battery go?", ["Blue bin", "Green bin", "Black bin", "Special drop-off"], 3, "Batteries and electronics must go to the special drop-off, never in any bin."),
    q("R2Q5", "Apply a Diagram", "Where does a chip bag belong?", ["Blue bin", "Green bin", "Black bin", "Special drop-off"], 2, "Chip bags and candy wrappers are listed under the black bin."),
    q("R2Q6", "Apply a Diagram", "By what time must bins be at the curb?", ["6:00 a.m.", "7:00 a.m.", "8:00 a.m.", "9:00 a.m."], 1, "Bins must be at the curb 'by 7:00 a.m.'."),
    q("R2Q7", "Apply a Diagram", "How should broken glass be handled?", ["Placed loose in the black bin", "Wrapped in newspaper before the blue bin", "Taken to the depot", "Placed in a plastic bag"], 1, "Broken glass should be 'wrapped in newspaper before it goes in the blue bin'."),
    q("R2Q8", "Apply a Diagram", "What should NOT be done with the bins?", ["Rinse recyclables", "Put them out weekly", "Block the sidewalk", "Separate organics"], 2, "Bins must be at the curb by 7 a.m. 'and not block the sidewalk'."),
  ],
};

// ---- Part 3 · Reading for Information (9 questions) ----
const R3: MockSection = {
  id: "R3",
  skill: "reading",
  title: "Part 3 · Reading for Information",
  instructions: "Read the article, then answer the questions that follow.",
  timeLimitSec: 900,
  passageTitle: "How community gardens are changing the city",
  passage:
    "When the city launched its community-garden program ten years ago, it expected a few hundred plots. Today there are more than four thousand, spread across every neighbourhood, and the waiting list for a plot is longer than ever.\n\nThe program works by converting unused city land — vacant lots, hydro corridors, even the flat roofs of older buildings — into shared growing spaces. Each plot rents for thirty-five dollars a season, which covers soil, water access, and tool storage. Priority is given to residents who live within a fifteen-minute walk of the site and to households with no private outdoor space.\n\nThe benefits go well beyond fresh vegetables. A 2024 study by the city's health department found that gardeners reported lower stress and more physical activity than non-gardeners in the same postal codes. Plots have also become informal meeting places, especially for newcomers, many of whom grow familiar crops from home and swap seeds with neighbours.\n\nThere are challenges too. Demand far exceeds supply, and some sites have struggled with vandalism and water shortages during dry summers. To address this, the city now installs rain barrels at every new site and has added a part-time coordinator to help resolve disputes between gardeners.\n\nA second wave of expansion is planned for next spring, with forty new sites expected to open and a pilot program to place small gardens on school grounds.",
  questions: [
    q("R3Q1", "Reading for Information", "How many community gardens does the city now have?", ["A few hundred", "About four thousand", "Forty", "Ten thousand"], 1, "There are 'more than four thousand' plots across the city."),
    q("R3Q2", "Reading for Information", "What kind of land does the program convert?", ["Private farmland", "Unused city land", "Newly built parks", "Commercial property"], 1, "The program converts 'unused city land' such as vacant lots and hydro corridors."),
    q("R3Q3", "Reading for Information", "How much does a plot cost per season?", ["Twenty dollars", "Thirty-five dollars", "Fifty dollars", "Nothing"], 1, "Each plot rents for 'thirty-five dollars a season'."),
    q("R3Q4", "Reading for Information", "Who gets priority for a plot?", ["Homeowners with large yards", "Residents within a 15-minute walk", "New residents only", "People who volunteer"], 1, "Priority goes to residents 'within a fifteen-minute walk' and households with no outdoor space."),
    q("R3Q5", "Reading for Information", "What did the 2024 study find?", ["Gardeners had lower stress and more activity", "Gardens lowered property values", "Gardens reduced crime", "Gardeners spent more money"], 0, "Gardeners reported 'lower stress and more physical activity' than non-gardeners."),
    q("R3Q6", "Reading for Information", "How do the plots help newcomers?", ["They offer free housing", "They become meeting places and seed swaps", "They provide paid work", "They teach driving"], 1, "Plots are 'informal meeting places, especially for newcomers', who swap seeds with neighbours."),
    q("R3Q7", "Reading for Information", "What challenge do some sites face?", ["Too many gardeners", "Vandalism and water shortages", "High rent", "Poor soil quality"], 1, "Some sites have 'struggled with vandalism and water shortages during dry summers'."),
    q("R3Q8", "Reading for Information", "What has the city done in response?", ["Closed the problem sites", "Installed rain barrels and added a coordinator", "Raised the plot rent", "Banned seed swapping"], 1, "The city now 'installs rain barrels' and 'added a part-time coordinator'."),
    q("R3Q9", "Reading for Information", "What is planned for next spring?", ["A plot rent increase", "Forty new sites and a school pilot", "Reducing the program", "A citywide garden contest"], 1, "Forty new sites are expected, plus 'a pilot program' on school grounds."),
  ],
};

// ---- Part 4 · Reading for Viewpoints (10 questions) ----
const R4: MockSection = {
  id: "R4",
  skill: "reading",
  title: "Part 4 · Reading for Viewpoints",
  instructions: "Read the two opinions, then answer the questions that follow.",
  timeLimitSec: 960,
  passageTitle: "Should the city build a new downtown stadium?",
  passage:
    "LETTER 1 — in favour\n\nA new downtown stadium is exactly the investment this city needs. Our current venue was built fifty years ago, has poor sightlines, and leaks whenever it rains. A modern arena would host not only our hockey team but also concerts and trade shows that currently skip our city for larger markets. Supporters point to the thousands of construction jobs it would create immediately, and the restaurants, hotels and transit revenue that would follow every game night. Critics say sports venues rarely pay for themselves, but that ignores the broader economic activity they anchor. If we build nothing, we quietly accept that our downtown will keep losing visitors to neighbouring cities that built years ago.\n\nLETTER 2 — opposed\n\nThe stadium boosters are asking taxpayers to gamble hundreds of millions of dollars on a building that will sit empty most days of the year. The promised construction jobs are temporary, and the teams that play there keep most of the ticket and broadcast revenue for themselves. Meanwhile, the city has schools with leaking roofs and a transit system that runs late every winter. A stadium is a 'want', not a 'need', and public money should fix needs first. If a stadium truly made financial sense, private investors would build it without asking the public to take the risk.",
  questions: [
    q("R4Q1", "Reading for Viewpoints", "What is the main topic of the two letters?", ["Whether to build a new downtown stadium", "How to fix the transit system", "Whether to raise ticket prices", "Where to hold a trade show"], 0, "Both letters argue for and against 'a new downtown stadium'."),
    q("R4Q2", "Reading for Viewpoints", "What is wrong with the current venue, according to Letter 1?", ["It is too expensive to rent", "It is fifty years old and leaks", "It is too far from downtown", "It is too small"], 1, "The current venue is 'fifty years old, has poor sightlines, and leaks whenever it rains'."),
    q("R4Q3", "Reading for Viewpoints", "What events would a new arena host, according to Letter 1?", ["Only hockey games", "Hockey, concerts, and trade shows", "School events only", "Political rallies"], 1, "A modern arena would host 'our hockey team but also concerts and trade shows'."),
    q("R4Q4", "Reading for Viewpoints", "What immediate benefit does Letter 1 describe?", ["Lower ticket prices", "Thousands of construction jobs", "Free transit", "More parking"], 1, "Supporters point to 'the thousands of construction jobs it would create immediately'."),
    q("R4Q5", "Reading for Viewpoints", "How does Letter 1 respond to the claim that venues do not pay for themselves?", ["It agrees completely", "It says this ignores broader economic activity", "It says the claim is a fact", "It has no response"], 1, "Letter 1 says that claim 'ignores the broader economic activity they anchor'."),
    q("R4Q6", "Reading for Viewpoints", "What is Letter 2's main objection?", ["The stadium is too small", "Taxpayers would gamble on a mostly-empty building", "The design is ugly", "The location is wrong"], 1, "Letter 2 says boosters are asking taxpayers to gamble on 'a building that will sit empty most days'."),
    q("R4Q7", "Reading for Viewpoints", "What does Letter 2 say about the construction jobs?", ["They are permanent", "They are temporary", "They are well paid", "They are unnecessary"], 1, "Letter 2 says 'the promised construction jobs are temporary'."),
    q("R4Q8", "Reading for Viewpoints", "Who keeps most ticket revenue, according to Letter 2?", ["The city", "The teams", "Local businesses", "The construction firms"], 1, "The teams 'keep most of the ticket and broadcast revenue for themselves'."),
    q("R4Q9", "Reading for Viewpoints", "What example does Letter 2 give of real needs?", ["New parks", "Schools with leaking roofs and late transit", "A new library", "More bike lanes"], 1, "Letter 2 points to 'schools with leaking roofs and a transit system that runs late every winter'."),
    q("R4Q10", "Reading for Viewpoints", "What does Letter 2 suggest should happen if a stadium made financial sense?", ["The city should build it", "Private investors would build it themselves", "The public should vote on it", "The teams should pay rent"], 1, "If it truly made sense, 'private investors would build it without asking the public to take the risk'."),
  ],
};

export const mock01Reading: MockSection[] = [R1, R2, R3, R4];


