# Halfway

A conversation card game for two people from different parts of the world.

## What it is

You and someone else each answer three questions — about loss, belonging, and what you're still searching for. The same questions. Different answers. Then AI reads all six and generates one question that sits between you both: the thing you circled without either of you saying it out loud.

That's the halfway point.

## How it works

1. Both people enter where they're from
2. Answer three questions drawn from a shared set of themes (Loss, Belonging, The Unknown, etc.)
3. The questions are personalized to your two locations by AI
4. After the last round, a halfway question is generated — a single provocation that finds what's underneath both sets of answers
5. The conversation is saved to your history

## Tech

- React + Vite
- Framer Motion for animations
- country-state-city for location data
- Gemini API (gemini-2.0-flash) for question personalization and halfway question generation
- Tailwind CSS with a custom ink/parchment design system

## Running locally

```bash
npm install
npm run dev
```

Requires a `.env` file with:

```
GEMINI_API_KEY=your_key_here
```
