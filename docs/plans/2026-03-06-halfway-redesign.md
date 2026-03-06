# Halfway — Full Redesign
**Date:** 2026-03-06
**Status:** Approved

---

## Concept

**Name:** Halfway
**Tagline:** "Where are you really from?"
**Subtitle:** A conversation for two strangers.

A philosophical conversation tool for anyone meeting someone from a different culture.
Both people answer the same 3 questions drawn from 6 philosophical topics. The AI reads
all six answers and generates one "Halfway Question" — the thing both people circled
without either saying it directly. Subtly opens toward meaning and transcendence without
ever feeling like a ministry script.

The Christian mission context lives in the volunteer's intent and in the design of the
Halfway Question. The student experiences a genuine, equal, curious conversation.

---

## Visual Identity

**Palette:**
- Background: parchment `#F5EFE0`
- Primary text: deep warm brown `#2C1810`
- Accent: terracotta `#C4622D`
- Supporting: dusty sage `#7A9E7E`
- Highlight: warm sand `#D4A96A`

**Typography:**
- Headings / topic names / Halfway Question: Playfair Display (serif)
- UI, answers, labels: Inter (humanist sans)

**Texture:** Subtle paper grain on backgrounds. Cards feel like torn journal pages.
Rounded corners throughout. Nothing sharp, cold, or clinical.

**Tone:** Independent bookshop. Warm, curious, unhurried.

---

## Entry Point

Full parchment screen. Plays a looping demo conversation before the user does anything:

1. Two cities fade in: "Seoul · Toronto"
2. A topic card flips: Loss — "What have you left behind that still travels with you?"
3. Two answers appear one at a time (typewriter style):
   - "Hotpot with my mom — I haven't found anything like it here"
   - "The feeling of walking into my home church on a Sunday morning"
4. A pause. Then the Halfway Question rises in large italic serif:
   - "You both described belonging as something tied to a specific person or place.
     What would it mean to find something like that which couldn't be taken away?"
5. It sits. Then quietly below:
   - "Halfway — Where are you really from?"
   - CTA: "Start a Conversation"

Returning users see a secondary link: "Past Conversations"

No map on the entry screen. No tutorial. The demo is the explanation.

---

## Encounter Flow

### Step 1 — Who's Here?
Two fields on a warm card:
- "You're from..." [city, country] — volunteer
- "They're from..." [city, country] — student
- Optional: names for both people

### Step 2 — Draw a Topic
6 cards face-down. Student draws one. Card flips revealing:
- Large serif topic name
- One-line philosophical question
- Warm icon

### Step 3 — Both Answer
Question sits on screen. Volunteer asks it aloud. Both answer verbally.
Volunteer captures short notes for each:
- "Their answer: ___"
- "Your answer: ___"

Both people answer. Equal footing. Neither is studying the other.

### Step 4 — Repeat x3
Draw, answer, capture. Three topics total. ~10-15 minutes.

### Step 5 — The Halfway Question
Brief warm loading state. Then one question appears centered in large italic serif
on a clean parchment screen. Both people sit with it together.

The volunteer does not need to answer it — they let it land.

### Step 6 — Save
Optional: take a photo together. Save the conversation to history.

---

## The 6 Philosophical Topics

| Icon | Topic | Question |
|------|-------|---------|
| Leaf | Loss | What have you left behind that still travels with you? |
| Wave | Belonging | Where do you feel most like yourself? |
| Sparkle | Beauty | What stops you in your tracks? |
| Dove | Enough | What would make your life feel complete? |
| House | Home | Where is home, really? |
| Moon | The Unknown | What are you still searching for? |

Each question works equally for both people regardless of culture or background.
Every answer reveals a worldview without being asked about one.

---

## The Halfway Question — AI Design

**Input to Gemini:**
- Person 1 city/country + 3 answers
- Person 2 city/country + 3 answers

**Prompt philosophy:**
- Find the thread that runs through both people's answers
- Name something neither person said explicitly but both circled
- Ask one question that lives in that shared space
- The question should feel like genuine philosophical curiosity
- It should subtly open toward meaning, belonging, and transcendence
- It should not mention religion, God, or faith — it opens the door through
  philosophy and human longing
- It should feel like it belongs to both people equally

**Output:** One question. Italic serif. Centered. No preamble.

---

## History / Past Conversations

Each saved conversation shows:
- The two cities (e.g. "Seoul · Toronto")
- The 3 topics drawn
- The Halfway Question in italic serif as a pull quote

**Atlas view** (secondary): world map showing where conversations have happened.
Accessible from a corner icon — a reward for returning users, not the entry point.

---

## Technical Stack

Same as current: React 18 + Vite + Tailwind CSS + Framer Motion
Gemini API (`gemini-2.0-flash`) for Halfway Question generation
Vercel serverless function: `/api/halfway-question.js`
localStorage for conversation history
Fonts: Playfair Display + Inter (Google Fonts)

---

## Files To Build (Full Rebuild)

| File | Purpose |
|------|---------|
| `src/App.jsx` | New entry point — demo loop + routing |
| `src/components/DemoLoop.jsx` | Animated opening demo conversation |
| `src/components/EncounterFlow.jsx` | Full 6-step encounter (replaces JournalModal) |
| `src/components/TopicCard.jsx` | Card flip animation + topic display |
| `src/components/HalfwayQuestion.jsx` | Final question reveal screen |
| `src/components/ConversationHistory.jsx` | Past conversations list |
| `src/components/AtlasView.jsx` | Secondary world map view |
| `src/data/topics.js` | 6 philosophical topics |
| `api/halfway-question.js` | Gemini serverless function |
| `src/index.css` | Parchment palette, Playfair Display, paper texture |

---

## Out of Scope (v1)

- Team/campus analytics
- Exportable conversation summaries
- Milestone rewards
- Push notifications
