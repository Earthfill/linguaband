# Shilu — CELPIP practice platform

A front-end clone of the celtestpip.com homepage experience, rebranded as
**Shilu** with original copy, built with the **same stack as the original**:
Next.js (App Router) + React + TypeScript + Tailwind CSS.

> Static demo build. Auth, payments, and live AI scoring are out of scope. All
> page content is public marketing copy used for design/study purposes. This
> project is not affiliated with Prometric or Paragon Testing Enterprises.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **Tailwind CSS v4** — design tokens live in `src/app/globals.css`
- Fonts: **Open Runde** (`@fontsource/open-runde`) for display headings +
  **Space Grotesk** (`next/font/google`) for body — both self-hosted
- Icons: hand-rolled inline SVG set in `src/components/icons.tsx`

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts: `npm run build` (type-check + production build), `npm start`,
`npm run lint`.

## Project structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Homepage composition
│   └── globals.css         # Tailwind v4 @theme design tokens
├── components/
│   ├── Header.tsx          # Sticky nav + dropdowns + mobile drawer
│   ├── Hero.tsx            # Headline, CTAs, trust row, dashboard mockup
│   ├── StatsBar.tsx        # Animated counters (CountUp)
│   ├── FeatureCards.tsx    # Mock Exams / AI Scoring / Explanations
│   ├── TestimonialCarousel.tsx # Auto-rotating reviews + dot pagination
│   ├── CoursesSection.tsx  # Course cards
│   ├── TemplatesSection.tsx# Speaking/Writing template cards
│   ├── StepsSection.tsx    # "How to prepare" 3-step guide
│   ├── AboutSection.tsx    # About blurb + stat cards
│   ├── VsIeltsBanner.tsx   # CELPIP vs IELTS banner
│   ├── FaqSection.tsx      # Accordion FAQ
│   ├── Footer.tsx          # Link columns, exam parts, legal, disclaimer
│   ├── icons.tsx           # Inline SVG icon set
│   └── ui/                 # Container, Logo, Reveal, CountUp, SectionHeading, Dropdown, DashboardMockup
└── data/                   # navigation, testimonials, faqs, content
```

## Practice screens (Practice submenu)

| Route | What it does |
|---|---|
| `/exams` | Mock exam library + full-screen timed exam player (MCQ, answer palette, timer, results review) |
| `/questions` | Searchable/filterable question bank wired to an interactive MCQ practice engine |
| `/listening` | Audio-mock player (simulated playback + transcript) with instant-check questions |
| `/reading` | Side-by-side passage reader + question panel |
| `/writing` | Email & survey task workspaces with word count + heuristic scoring preview |
| `/speaking` | 8 task cards with a prep/speak timer studio + CLB-graded sample responses |

All practice content lives in `src/data/practice/` (original study material written for
Shilu); UI engines live in `src/components/practice/`.

## Design tokens (from the original site)

| Token | Value |
|---|---|
| Background | `#fafafa` (zinc-50) |
| Text | `zinc-900 / zinc-700 / zinc-500` |
| Accent | `#2563eb` (blue-600) |
| Buttons | `rounded-full`, zinc-900 pills |
| Cards | `rounded-2xl`, `border-zinc-200`, `shadow-sm` |
| Badges | blue / violet / teal / amber / emerald soft tints |
| Fonts | Open Runde (display), Space Grotesk (body) |

## Listening audio

Listening exercises use **real, human-sounding audio** generated from each script's
`SPEAKER: text` lines. Every speaker gets its own neural voice from the newer
generation exposed by [`msedge-tts`](https://www.npmjs.com/package/msedge-tts), and
each part is written as one MP3 under `public/audio/` with a manifest of per-speaker
*and per-sentence* timings in `src/data/practice/audio-manifest.ts` (so the player can
highlight the exact sentence being spoken).

```bash
npm run audio:generate                 # regenerate all parts at 96 kbps
npm run audio:generate L5              # regenerate one part by id
npm run audio:generate -- --bitrate=48 # regenerate everything at 48 kbps (smaller files)
```

Audio defaults to 24 kHz **96 kbps** mono MP3. If the Edge endpoint drops a segment's
96 kbps stream after retries, that part automatically falls back to 48 kbps (and the
run reports which parts were affected). The generator also verifies every MP3 frame is
uniform CBR so the timings can never drift silently. The command needs network access
to the Microsoft Edge Read Aloud endpoint; the app degrades gracefully if audio is
missing (it falls back to the plain transcript).

## Admin — adding mock tests

A password-protected `/admin` page accepts one JSON file per mock test. The file matches
the existing `MockExam` shape:

```json
{
  "id": "mock-02",
  "name": "Mock Test 02",
  "badge": "Timed",
  "difficulty": "Standard",
  "description": "...",
  "sections": [
    {
      "id": "M2L1",
      "skill": "listening",
      "title": "Part 1 · Listening to Problem Solving",
      "instructions": "...",
      "timeLimitSec": 360,
      "passageTitle": "Customer service call",
      "passage": "AGENT: Halton Home Services, this is Priya.\nCUSTOMER: Hi — I have a leak.",
      "questions": [
        { "id": "M2L1Q1", "label": "Question 1", "part": "Part 1 · Problem Solving", "question": "...", "options": ["A", "B", "C", "D"], "answerIndex": 1, "explanation": "..." }
      ]
    },
    { "id": "M2W1", "skill": "writing", "title": "Writing Task 1 · Email", "instructions": "...", "timeLimitSec": 1620, "questions": [], "writingTask": { "id": "M2W1", "task": "Writing Task 1", "title": "Writing an Email", "timeLimit": "27 min", "wordTarget": "150–200 words", "scenario": "...", "instructions": ["..."], "sampleAnswer": "...", "criteria": [{ "label": "Content", "note": "..." }] } },
    { "id": "M2S1", "skill": "speaking", "title": "Speaking Task 1 · Giving Advice", "instructions": "...", "timeLimitSec": 90, "questions": [], "speakingTask": { "id": "M2S1", "title": "Task 1: Giving Advice", "scenario": "...", "prepTimeSec": 30, "speakTimeSec": 60, "tips": ["..."], "sampleAnswer": "...", "clb": "CLB 9 sample" } }
  ]
}
```

Rules the upload enforces: section ids must be unique across every mock (they key the
audio), listening passages must be `SPEAKER: text` lines, and questions need exactly 4
options with a valid answer index. Keeping 38 listening + 38 reading questions preserves
the calibrated CLB estimate (otherwise it warns and falls back to percent-based). On
upload the text goes live immediately; listening audio is generated in the background
(about 2 minutes) via a GitHub Actions job.

## Deploying to Cloudflare Workers

The app runs on Cloudflare (free tier, business use allowed) via `@opennextjs/cloudflare`.

1. `npx wrangler login`
2. Create the database: `npx wrangler d1 create shilu-db`, then paste its id into
   `wrangler.jsonc` (`database_id`).
3. Apply the schema: `npx wrangler d1 migrations apply shilu-db --remote`.
4. Create the bucket: `npx wrangler r2 bucket create shilu-audio`.
5. Copy `.dev.vars.example` to `.dev.vars` and set `ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET`
   for local development.
6. Deploy: push to `main` (GitHub Actions builds and deploys), or run `npm run deploy`.

GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
`CLOUDFLARE_DATABASE_ID` (the D1 id), and `AUDIO_BASE_URL` (public prefix for R2 audio,
e.g. `https://audio.example.com`). The app also needs `GITHUB_TOKEN` and `GITHUB_REPO`
environment variables so `/admin` can trigger the audio-generation job.

