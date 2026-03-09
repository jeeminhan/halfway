# Halfway App — Six Feature Design
**Date:** 2026-03-09

## Overview
Six features across the Halfway app (`/Users/jeeminhan/Code/global-atlas`): a revised onboarding intro, serendipitous email follow-up, voice-to-text input, a map in conversation history, a live map during country selection, and a frontend-only public social feed demo.

---

## Feature 1 — Revised Intro Card
**File:** `src/components/OnboardingScreen.jsx`

Add a new first slide to the `SLIDES` array (before the existing three). Framing: this is an app for building bridges between people from completely different cultures and countries. The interaction may serendipitously continue — or quietly fade. Matches existing slide shape (icon, heading, body). No new infrastructure.

---

## Feature 2 — Serendipitous Email Follow-up
**Files:** `src/components/HalfwayQuestion.jsx`, `api/schedule-followup.js`

After the halfway question reveals, show an optional email capture step: two fields (one per person), clearly labeled as optional. On submit:
- Call `/api/schedule-followup` with both emails, both city/country pairs, the rounds, and the halfway question
- API generates a new AI follow-up question (Gemini) that deepens the cultural intersection
- Sends via Resend with `scheduledAt` = now + random(1, 30) days
- Email includes both cities, original halfway question, and the new follow-up question

No cron job needed — Resend handles scheduled delivery natively. Free tier sufficient.

---

## Feature 3 — Voice to Text
**Files:** `src/components/EncounterFlow.jsx`

Add a mic button to each answer textarea using the browser Web Speech API (free, no key). Behavior:
- Tap to start: pulsing indicator, live transcript populates the textarea
- Tap to stop or auto-stops on silence
- Transcript is fully editable after recording
- Button hidden if `window.SpeechRecognition` not available

No API cost. Works natively in Chrome, Edge, Safari.

---

## Feature 4 — Map in Conversation History
**Files:** `src/components/ConversationHistory.jsx`

Add a Leaflet map above the card list. For each conversation:
- Two markers: Person 1 city (terracotta) and Person 2 city (sage)
- A curved arc connecting them
- A pulsing midpoint marker at the geographic center
- Clicking the midpoint opens a popup showing the halfway question

Use `country-state-city` lat/lng data for geocoding — no external API. Falls back to country centroid if city lat/lng is unavailable.

---

## Feature 5 — Live Map During Country Selection
**Files:** `src/components/CountryPicker.jsx`, `src/components/EncounterFlow.jsx`

During the two-person setup steps, show a small Leaflet map panel below the search fields:
- After Person 1 selects their country: their pin appears on the map
- After Person 2 selects their country: both pins appear with a line and a pulsing midpoint dot
- Map auto-pans/zooms to fit both markers when both are set
- Pure visual, no interaction required

---

## Feature 6 — Public Social Feed (Frontend Demo)
**Files:** `src/components/ConversationHistory.jsx`, `src/components/CommunityFeed.jsx` (new)

A toggle in `ConversationHistory` switches between "My Conversations" and "Community" views.

**Community view:**
- 3–4 hardcoded mock stories with diverse city pairs and compelling halfway questions
- Each story card shows: both cities, topics covered, halfway question, emoji reaction counts, anonymous comment thread
- Users can tap emoji reactions (state-only, no persistence)
- Users can post anonymous comments (component state, resets on reload)
- Full visual design ready to wire to Supabase backend later

**Mock stories should include:**
- Lagos × Seoul
- Karachi × São Paulo
- Cairo × Mexico City
- Nairobi × Reykjavik

---

## Implementation Order
1. Feature 1 (easiest, zero deps)
2. Feature 3 (voice, self-contained)
3. Feature 5 (map in country picker)
4. Feature 4 (map in history)
5. Feature 6 (social feed demo)
6. Feature 2 (email — needs Resend account setup)
