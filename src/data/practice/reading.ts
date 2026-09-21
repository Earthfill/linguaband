import type { ReadingPassage } from "./types";

export const readingPassages: ReadingPassage[] = [
  {
    id: "rd-01",
    title: "Apartment notice — laundry room hours",
    part: "Reading Correspondence",
    wordCount: 152,
    timeLimit: "3 min",
    passage:
      "To all residents of Glencove Apartments,\n\nStarting Monday, October 3, the laundry room on the ground floor will operate on reduced hours. Machines will run from 8:00 a.m. to 9:00 p.m., seven days a week, instead of the current 24-hour schedule. This change is required to complete a plumbing upgrade requested by the building's insurer.\n\nThe two dryers on the far wall will be out of service during the first week while they are replaced with quieter models. To reserve a machine, please place a laundry basket on top of it — baskets left for longer than 45 minutes will be removed to a cart by the door.\n\nIf you have questions about the new schedule, email the building office before October 2. Please do not contact the maintenance contractors directly.\n\nManagement reserves the right to extend the reduced hours if construction is delayed.",
    questions: [
      {
        id: "rd-01-q1",
        label: "Question 1",
        part: "Reading Correspondence",
        question:
          "Why is the laundry room schedule changing?",
        options: [
          "The building office is hiring new staff",
          "A plumbing upgrade was required by the insurer",
          "Residents complained about noise at night",
          "The machines are being permanently removed",
        ],
        answerIndex: 1,
        explanation:
          "The notice states the reduced hours 'are required to complete a plumbing upgrade requested by the building's insurer.'",
      },
      {
        id: "rd-01-q2",
        label: "Question 2",
        part: "Reading Correspondence",
        question:
          "What might happen if a laundry basket is left on a machine too long?",
        options: [
          "It will be placed in a cart by the door",
          "The owner must pay a storage fee",
          "The items will be thrown away",
          "It will be moved to the office",
        ],
        answerIndex: 0,
        explanation:
          "The notice explains that 'baskets left for longer than 45 minutes will be removed to a cart by the door.'",
      },
      {
        id: "rd-01-q3",
        label: "Question 3",
        part: "Reading Correspondence",
        question:
          "How should residents ask questions about the change?",
        options: [
          "Call the maintenance contractors directly",
          "Speak to the plumber on site",
          "Email the building office before October 2",
          "Wait until the machines reopen",
        ],
        answerIndex: 2,
        explanation:
          "Residents are told to 'email the building office before October 2' and explicitly not to contact the contractors.",
      },
    ],
  },
  {
    id: "rd-02",
    title: "Hamilton walking trail guide",
    part: "Reading Information",
    wordCount: 170,
    timeLimit: "4 min",
    passage:
      "The Cootes Paradise trail forms a 12-kilometre loop used by walkers, runners, and cyclists. The full loop takes about three hours at a relaxed pace and is best started from the west parking lot, where washroom facilities open daily at 6 a.m.\n\nSection A, from the parking lot to the observation deck, is fully paved and suitable for strollers and wheelchairs. Section B, between the deck and the old mill, follows the shoreline and includes narrow wooden bridges that can be slippery after rain. Dogs are welcome but must remain leashed on Section B.\n\nThe observation deck closes at dusk for wildlife protection. Cyclists must yield to pedestrians at all points, and e-bikes are restricted to Section A only.\n\nIn November, the eastern half of the loop is closed for wetland restoration. Check the city parks website for weekly trail alerts before planning a visit.",
    questions: [
      {
        id: "rd-02-q1",
        label: "Question 1",
        part: "Reading Information",
        question:
          "Where is the recommended starting point for the full loop?",
        options: [
          "From the observation deck",
          "From the old mill parking area",
          "From the west parking lot",
          "From the east trail head",
        ],
        answerIndex: 2,
        explanation:
          "The guide says the loop 'is best started from the west parking lot, where washroom facilities open daily at 6 a.m.'",
      },
      {
        id: "rd-02-q2",
        label: "Question 2",
        part: "Reading Information",
        question:
          "Which rule applies on Section A specifically?",
        options: [
          "Dogs must always be leashed",
          "E-bikes are restricted to this section only",
          "The section closes at dusk",
          "Cyclists must dismount",
        ],
        answerIndex: 1,
        explanation:
          "The restriction 'e-bikes are limited to Section A only' is stated near the end, so scan for the section-letter qualifiers.",
      },
      {
        id: "rd-02-q3",
        label: "Question 3",
        part: "Reading Information",
        question:
          "Why is part of the trail closed in November?",
        options: [
          "To repair wooden bridges",
          "For wetland restoration",
          "For wildlife breeding season",
          "To rebuild the parking lot",
        ],
        answerIndex: 1,
        explanation:
          "The final paragraph says 'the eastern half of the loop is closed for wetland restoration' in November.",
      },
    ],
  },
];
