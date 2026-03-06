# Global Atlas v2 — Person-First Redesign
**Date:** 2026-03-06
**Status:** Approved

---

## Problem Statement

1. **Depth** — One question per interaction feels too quick and forced (resonance score 2/4).
2. **India/China differentiation** — When most students come from the same 1–2 countries, the map looks sparse and individual students blur together.
3. **Demo/onboarding gap** — The app is also a showcase tool. New evaluators land on an empty map and don't understand the concept without meeting real students.

---

## Design: Person-First Architecture

### Core Principle
The fundamental unit is the **individual person**, not the country. The map is a visualization layer on top of a people database.

---

## 1. Data Model

Replace the current flat entry shape with a Person model:

```js
// Old
{ country, region, souvenir, answer, photo }

// New
{
  id: string,           // uuid
  name: string,         // optional — student's name
  country: string,
  city: string,
  souvenirs: [          // 2–3 rolls
    { id, title, icon, question, answer, color }
  ],
  photo: string | null, // base64 (compressed)
  createdAt: string,    // ISO date
  isDemo: boolean       // true for pre-loaded demo entries
}
```

**localStorage key:** `global-atlas-people` (new key, old `global-atlas-entries` ignored)

**Map color derivation:** count distinct non-demo persons per country.
- 0 → unvisited (gray)
- 1 → bronze
- 2 → silver
- 3+ → gold

---

## 2. Journal Flow (4 Steps)

**Step 1 — City** (unchanged): Search and select city/region.

**Step 2 — Name** (new): Optional text field. "What's their name?" with a skip button.

**Step 3 — Souvenir Rolls** (expanded): Roll die 2–3 times. Each roll picks a random souvenir (no repeats). After each roll, user types the answer before rolling again. A progress indicator shows "Roll 1 of 2" etc. User can stop at 2 or continue to a 3rd roll.

**Step 4 — Photo + Save** (unchanged): Selfie capture, then "Stamp Passport."

---

## 3. People Book (replaces PassportGallery)

- Full-screen overlay, same as current PassportGallery
- Each card = one person (name or "Anonymous", city, country, photo, 2–3 souvenir chips)
- Expandable card shows all answers in full
- Delete button on each card (with confirm)
- Demo entries shown with a "DEMO" badge; real entries shown normally
- Filtering: When user clicks a colored country on the map, People Book opens pre-filtered to that country

---

## 4. Demo Mode

**Pre-loaded data (10 people, isDemo: true):**
- India: 3 people (Mumbai, Delhi, Bangalore)
- China: 2 people (Beijing, Shanghai)
- Brazil, Japan, Nigeria, South Korea, Mexico: 1 each

Demo entries are pre-populated in the app's initial state if `global-atlas-people` is not yet in localStorage (first visit).

**"Try It" guided simulation:**
- A "Try Demo" button in RulesModal (and a floating button on the map)
- Triggers the Journal flow with South Korea / Seoul pre-filled
- Auto-rolls the die after a short delay with a visual cue
- Shows a pre-written example answer with typewriter effect
- On save, adds a real entry (not demo) so the user has completed one real stamp

---

## 5. Onboarding

- First visit (no `global-atlas-onboarded` in localStorage) → auto-open RulesModal
- RulesModal bottom CTA: "Got it, let's explore!" (existing) + "Try Demo Walk-through" (new)
- After onboarding completes, set `global-atlas-onboarded: true`

---

## 6. Map Hover Preview

- Hovering a visited country shows a tooltip with country name, number of people met, and thumbnail of first person's photo (or flag emoji fallback)
- Fixes existing bug: adds data-tooltip-id to Geography elements

---

## 7. Image Compression

Before saving photo to localStorage, compress with canvas:
- Max dimension: 400px
- JPEG quality: 0.7
- Prevents localStorage 5MB overflow

---

## Components Affected

| Component | Change |
|---|---|
| `App.jsx` | New people state, new countryStats derivation, filter state for People Book |
| `JournalModal.jsx` | 4-step flow, multi-roll, name field |
| `SouvenirDie.jsx` | Minor: expose no-repeat roll logic |
| `PassportGallery.jsx` | Full rewrite as PeopleBook |
| `WorldMap.jsx` | Hover preview (fix tooltip bug), click passes country filter |
| `RulesModal.jsx` | Add "Try Demo" CTA |
| `src/data/demoData.js` | New file: 10 pre-loaded people |
| `src/utils/imageUtils.js` | New file: canvas compression helper |

---

## Out of Scope (v2)

- Export/download summary (defer to v3)
- Milestone/badge system (defer to v3)
- "What's Next?" progression arc (defer to v3)
- Voice memos or student-contributed content
