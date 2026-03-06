# Global Atlas v3 — AI Spiritual Question Arc Design
**Date:** 2026-03-06
**Status:** Approved

---

## Problem Statement

The current Souvenir Die asks generic cultural questions (same question regardless of country).
This misses the full value of knowing a student's country, city, and religious background —
information that could enable much more meaningful, spiritually intelligent conversations.

---

## Design

### New Data Captured (Step 3 of JournalModal)

Between the Name step and the first die roll, add:

**"Spiritual Roots 🌱"**
> *"What faith tradition shaped how you grew up?"*

Options (tap to select):
Buddhist · Muslim · Hindu · Christian · Confucian/Folk Religion · Secular/None · Other

This is student-facing — shown on screen with the student present. Framed as curiosity
about their background, not a theological interrogation. "Grew up with" (past tense)
is intentionally non-threatening.

---

### AI Question Generation

On each die roll, the app calls a Vercel serverless function (`/api/generate-question`)
which calls Google Gemini API with:

```
Input:
  country: string           // e.g. "Taiwan"
  city: string              // e.g. "Kaohsiung"
  spiritualBackground: string // e.g. "Buddhist / Folk Religion"
  souvenirTopic: string     // e.g. "legend"
  rollNumber: 1 | 2 | 3    // determines Resonate / Dissonate / Complete

Output:
  question: string          // single, culturally-specific, embedded-coaching question
```

**System prompt:** Full contents of `docs/evangelism-philosophy.md`

**Model:** `gemini-2.0-flash` (same as translateio)
**Package:** `@google/generative-ai` (same as translateio)
**Env var:** `GEMINI_API_KEY`

---

### Embedded Coaching Principle

No separate coaching card. The question itself carries the cultural intelligence,
the Sam Chan arc phase, and the spiritual probe in its phrasing.

The student sees: genuine cultural curiosity.
The volunteer reads: exactly which worldview tension is being surfaced.

Example — Taiwan / Kaohsiung / Folk Religion / Legend / Roll 2 (Dissonate):
> *"Ghost Month in Kaohsiung is built around keeping spirits appeased —
> offerings, specific timing, things you have to avoid getting right. Did those
> rituals ever start to feel like something you had to manage, rather than
> something that actually brought you peace?"*

---

### Fallback Behavior

If the API call fails or exceeds 3 seconds:
- Show the existing generic souvenir question (current behavior)
- No error shown to user — experience degrades gracefully
- Log failure silently

---

### Loading State

Die animation plays while question generates. No extra spinner needed.
The animation already takes ~0.8s which covers most API latency.

---

### Vercel API Route

`/api/generate-question.js` — Vercel serverless function

```js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { join } from "path";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const { country, city, spiritualBackground, souvenirTopic, rollNumber } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const philosophy = readFileSync(
        join(process.cwd(), "docs/evangelism-philosophy.md"), "utf-8"
    );

    const arcPhase = rollNumber === 1 ? "Resonate"
        : rollNumber === 2 ? "Dissonate"
        : "Complete";

    const prompt = `
You are generating a single conversation question for an ISM (International Student Ministry)
volunteer who is meeting a student from ${city}, ${country}.

Student spiritual background: ${spiritualBackground}
Souvenir Die topic: ${souvenirTopic}
Sam Chan arc phase: ${arcPhase} (Roll ${rollNumber} of 3)

Generate ONE question. The question must:
- Be culturally specific to ${city}, ${country} — reference actual local practices,
  landmarks, traditions, or cultural concepts where possible
- Follow the ${arcPhase} phase of Sam Chan's Resonate/Dissonate/Complete arc
- Have the coaching embedded in the phrasing — no separate explanation needed
- Feel like genuine human curiosity, not a ministry script
- Be appropriate for the student's ${spiritualBackground} background
- Be a single question only — no multiple questions, no lists

Return only the question text. No preamble, no explanation.
`;

    try {
        const result = await model.generateContent([
            { text: philosophy },
            { text: prompt }
        ]);
        const question = result.response.text().trim();
        res.status(200).json({ question });
    } catch (err) {
        res.status(500).json({ error: "generation_failed" });
    }
}
```

---

### JournalModal Changes

1. Add Step 3: Spiritual Roots (between Name and die rolls)
   - Grid of 7 options: Buddhist, Muslim, Hindu, Christian, Confucian/Folk Religion, Secular/None, Other
   - Can skip (defaults to "Unknown" — AI will infer from country)

2. On each die roll: call `/api/generate-question` with all context
   - While loading: show die animation + souvenir title, question area shows subtle skeleton
   - On success: reveal question with fade-in
   - On failure: fall back to `souvenir.question` from souvenirData.js

3. Store `spiritualBackground` on the Person object in localStorage

---

### Data Model Addition

```js
// Person object gains one field:
{
  ...existing fields,
  spiritualBackground: string | null  // "Buddhist", "Muslim", etc. or null if skipped
}
```

---

## Files Affected

| File | Change |
|---|---|
| `src/components/JournalModal.jsx` | Add spiritual roots step, AI question fetch per roll |
| `src/data/souvenirData.js` | No change — used as fallback |
| `api/generate-question.js` | New Vercel serverless function |
| `docs/evangelism-philosophy.md` | New — system prompt for AI |
| `package.json` | Add `@google/generative-ai` |
| `.env.local` | Add `GEMINI_API_KEY` |
| `vercel.json` | Confirm functions config (may already work) |

---

## Environment Setup

```bash
# .env.local
GEMINI_API_KEY=<same key used in translateio>
```

The key already exists in the translateio project — reuse it.

---

## Out of Scope (v3)

- Follow-up conversation arc (post-interaction suggestions)
- Saving generated questions to the person record for later review
- Team/campus-level analytics
