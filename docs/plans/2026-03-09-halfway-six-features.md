# Halfway App — Six Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add six features to the Halfway app: revised onboarding, email follow-up, voice-to-text, map in history, map during country selection, and a public social feed demo.

**Architecture:** React 18 + Vite frontend with Vercel serverless API functions. Leaflet (already installed) handles all maps. Resend handles scheduled email delivery. No new database — social feed is frontend-only mock. Voice uses the native browser Web Speech API.

**Tech Stack:** React, Tailwind CSS, Framer Motion, Leaflet/react-leaflet, country-state-city, Gemini API, Resend (new), Web Speech API (browser native)

**Dev server:** `cd /Users/jeeminhan/Code/global-atlas && npm run dev` → http://localhost:5173

---

## Task 1: Revised Intro Card (Feature 1)

**Files:**
- Modify: `src/components/OnboardingScreen.jsx`

**Step 1: Add the new first slide**

Open `src/components/OnboardingScreen.jsx`. The `SLIDES` array currently has 3 items. Prepend a new slide:

```js
const SLIDES = [
  {
    icon: '🌉',
    heading: 'Two worlds. One bridge.',
    body: 'Halfway is for meeting someone from a completely different culture and country — and finding the thing you share without knowing it. The conversation might serendipitously continue. Or it quietly fades. Either way, something real happened.',
  },
  // ... existing slides unchanged
]
```

**Step 2: Verify manually**

Run `npm run dev`. Open the app. The first onboarding slide should now show the bridge icon and the new copy. Swipe/continue through all four slides to make sure they all still work. "Skip intro" should still work.

**Step 3: Commit**

```bash
cd /Users/jeeminhan/Code/global-atlas
git add src/components/OnboardingScreen.jsx
git commit -m "feat: add bridge-building intro slide to onboarding"
```

---

## Task 2: Geo Utility (shared by Tasks 3, 4, 5)

**Files:**
- Create: `src/utils/geo.js`

**Step 1: Create the utility**

```js
// src/utils/geo.js
import { Country, City } from 'country-state-city'

/**
 * Returns { lat, lng } for a given country name + optional city name.
 * Falls back to country centroid if city not found.
 * Returns null if country not found.
 */
export function getLatLng(countryName, cityName) {
  const allCountries = Country.getAllCountries()
  const countryObj = allCountries.find(c => c.name === countryName)
  if (!countryObj) return null

  if (cityName) {
    const cities = City.getCitiesOfCountry(countryObj.isoCode) || []
    const cityObj = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase())
    if (cityObj?.latitude && cityObj?.longitude) {
      return { lat: parseFloat(cityObj.latitude), lng: parseFloat(cityObj.longitude) }
    }
  }

  if (countryObj.latitude && countryObj.longitude) {
    return { lat: parseFloat(countryObj.latitude), lng: parseFloat(countryObj.longitude) }
  }

  return null
}

/**
 * Returns the geographic midpoint between two { lat, lng } points.
 */
export function midpoint(a, b) {
  return {
    lat: (a.lat + b.lat) / 2,
    lng: (a.lng + b.lng) / 2,
  }
}
```

**Step 2: Verify manually**

Add a quick console.log in App.jsx temporarily:
```js
import { getLatLng, midpoint } from './utils/geo'
console.log(getLatLng('South Korea', 'Seoul'))    // should log { lat: 37.566, lng: 126.977 }
console.log(getLatLng('Canada', 'Toronto'))        // should log { lat: 43.7, lng: -79.4 }
```
Remove the log after verifying.

**Step 3: Commit**

```bash
git add src/utils/geo.js
git commit -m "feat: add geo utility for lat/lng lookup and midpoint"
```

---

## Task 3: Map in Conversation History (Feature 4)

**Files:**
- Create: `src/components/HistoryMap.jsx`
- Modify: `src/components/ConversationHistory.jsx`

**Step 1: Create HistoryMap component**

This renders a Leaflet map showing all past conversations as two markers + a line + a clickable midpoint.

```jsx
// src/components/HistoryMap.jsx
import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getLatLng, midpoint } from '../utils/geo'

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    const L = window.L || require('leaflet')
    // Use leaflet's latLngBounds
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 4)
    } else {
      const lats = points.map(p => p.lat)
      const lngs = points.map(p => p.lng)
      map.fitBounds([
        [Math.min(...lats) - 5, Math.min(...lngs) - 5],
        [Math.max(...lats) + 5, Math.max(...lngs) + 5],
      ], { padding: [20, 20] })
    }
  }, [points.length]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function HistoryMap({ conversations }) {
  const [activeQuestion, setActiveQuestion] = useState(null)

  const pins = conversations.map(convo => {
    const ll1 = getLatLng(convo.person1?.country, convo.person1?.city)
    const ll2 = getLatLng(convo.person2?.country, convo.person2?.city)
    if (!ll1 || !ll2) return null
    return { convo, ll1, ll2, mid: midpoint(ll1, ll2) }
  }).filter(Boolean)

  const allPoints = pins.flatMap(p => [p.ll1, p.ll2])

  return (
    <div className="h-48 w-full rounded-2xl overflow-hidden border border-sand/30">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ width: '100%', height: '100%', background: '#F5EFE0' }}
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          url={`https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg${import.meta.env.VITE_STADIA_MAPS_API_KEY ? `?api_key=${import.meta.env.VITE_STADIA_MAPS_API_KEY}` : ''}`}
        />
        {allPoints.length > 0 && <FitBounds points={allPoints} />}
        {pins.map(({ convo, ll1, ll2, mid }) => (
          <React.Fragment key={convo.id}>
            {/* Line between the two cities */}
            <Polyline
              positions={[[ll1.lat, ll1.lng], [ll2.lat, ll2.lng]]}
              pathOptions={{ color: '#C4622D', weight: 1.5, opacity: 0.4, dashArray: '4 4' }}
            />
            {/* Person 1 dot */}
            <CircleMarker
              center={[ll1.lat, ll1.lng]}
              radius={5}
              pathOptions={{ fillColor: '#C4622D', fillOpacity: 0.8, color: '#C4622D', weight: 1 }}
            />
            {/* Person 2 dot */}
            <CircleMarker
              center={[ll2.lat, ll2.lng]}
              radius={5}
              pathOptions={{ fillColor: '#7A9E7E', fillOpacity: 0.8, color: '#7A9E7E', weight: 1 }}
            />
            {/* Midpoint — clickable */}
            <CircleMarker
              center={[mid.lat, mid.lng]}
              radius={7}
              pathOptions={{ fillColor: '#D4A96A', fillOpacity: 0.9, color: '#9B7653', weight: 1.5 }}
              eventHandlers={{ click: () => setActiveQuestion(activeQuestion === convo.id ? null : convo.id) }}
            >
              {activeQuestion === convo.id && (
                <Popup>
                  <div className="max-w-[200px] text-center p-1">
                    <p className="text-[10px] uppercase tracking-widest text-sand font-semibold mb-1">✦ Halfway</p>
                    <p className="font-serif italic text-brown-deep text-xs leading-relaxed">
                      "{convo.halfwayQuestion}"
                    </p>
                  </div>
                </Popup>
              )}
            </CircleMarker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  )
}
```

**Step 2: Add HistoryMap to ConversationHistory**

In `src/components/ConversationHistory.jsx`, import HistoryMap and add it above the card list when there are conversations with two locations:

```jsx
import HistoryMap from './HistoryMap'

// Inside the ConversationHistory component, replace the card list section:
<div className="px-6 pb-10 space-y-4 max-w-md mx-auto">
  {conversations.length === 0 ? (
    <p className="font-serif italic text-brown-deep/30 text-center mt-20 text-lg">
      No conversations yet.
    </p>
  ) : (
    <>
      <HistoryMap conversations={conversations} />
      {conversations.map(convo => (
        <ConvoCard key={convo.id} convo={convo} />
      ))}
    </>
  )}
</div>
```

**Step 3: Verify manually**

Run the app. Create or use an existing conversation with two countries. Go to Past Conversations. The map should appear at the top with two colored dots, a dashed line, and a gold midpoint. Clicking the midpoint should show the halfway question in a popup.

**Step 4: Commit**

```bash
git add src/components/HistoryMap.jsx src/components/ConversationHistory.jsx
git commit -m "feat: add conversation map to history view"
```

---

## Task 4: Live Map During Country Selection (Feature 5)

**Files:**
- Modify: `src/components/EncounterFlow.jsx`
- Modify: `src/components/CountryPicker.jsx`
- Modify: `src/components/WatercolorMap.jsx`

The CountryPicker already renders a WatercolorMap. We need to:
1. Pass Person 1's confirmed location to the Person 2 CountryPicker as a second marker
2. Update WatercolorMap to render lat/lng pin markers + line + midpoint when given two positions

**Step 1: Add pin + arc rendering to WatercolorMap**

Add imports at the top:
```js
import { CircleMarker, Polyline, useMap } from 'react-leaflet'
import { getLatLng, midpoint } from '../utils/geo'
```

Add a `FitTwo` sub-component (after `FlyToCountry`):
```jsx
function FitTwo({ pos1, pos2 }) {
  const map = useMap()
  useEffect(() => {
    if (!pos1 || !pos2) return
    map.fitBounds([
      [Math.min(pos1.lat, pos2.lat) - 5, Math.min(pos1.lng, pos2.lng) - 10],
      [Math.max(pos1.lat, pos2.lat) + 5, Math.max(pos1.lng, pos2.lng) + 10],
    ], { duration: 1 })
  }, [pos1?.lat, pos1?.lng, pos2?.lat, pos2?.lng]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
```

Add a `secondaryCountry` and `secondaryCity` prop to the WatercolorMap signature:
```js
export default function WatercolorMap({ onCountryClick, selectedCountry, markers = [], secondaryCountry, secondaryCity }) {
```

Inside the `MapContainer` JSX, after the existing GeoJSON, add:
```jsx
{(() => {
  if (!selectedCountry || !secondaryCountry) return null
  const pos1 = getLatLng(secondaryCountry, secondaryCity)
  const pos2 = getLatLng(selectedCountry)
  if (!pos1 || !pos2) return null
  const mid = midpoint(pos1, pos2)
  return (
    <>
      <FitTwo pos1={pos1} pos2={pos2} />
      <Polyline
        positions={[[pos1.lat, pos1.lng], [pos2.lat, pos2.lng]]}
        pathOptions={{ color: '#C4622D', weight: 1.5, opacity: 0.35, dashArray: '5 5' }}
      />
      <CircleMarker center={[pos1.lat, pos1.lng]} radius={6}
        pathOptions={{ fillColor: '#C4622D', fillOpacity: 0.85, color: '#fff', weight: 1.5 }} />
      <CircleMarker center={[pos2.lat, pos2.lng]} radius={6}
        pathOptions={{ fillColor: '#7A9E7E', fillOpacity: 0.85, color: '#fff', weight: 1.5 }} />
      <CircleMarker center={[mid.lat, mid.lng]} radius={5}
        pathOptions={{ fillColor: '#D4A96A', fillOpacity: 1, color: '#9B7653', weight: 1.5 }} />
    </>
  )
})()}
```

**Step 2: Pass secondary location to CountryPicker**

In `CountryPicker.jsx`, add two new props: `secondaryCountry` and `secondaryCity`. Pass them into the WatercolorMap call:

```jsx
export default function CountryPicker({ label, accentColor, onConfirm, onSkip, initialCountry, initialCity, locked, secondaryCountry, secondaryCity }) {
  // ...
  // Find the WatercolorMap usage and update it:
  <WatercolorMap
    selectedCountry={selectedCountry}
    onCountryClick={handleMapClick}
    secondaryCountry={secondaryCountry}
    secondaryCity={secondaryCity}
  />
```

**Step 3: Pass Person 1's location to Person 2's CountryPicker in EncounterFlow**

In `EncounterFlow.jsx`, find the Person 2 CountryPicker and add the secondary props:

```jsx
<CountryPicker
  label="Them"
  accentColor="sage"
  initialCountry={initialPerson2?.country}
  initialCity={initialPerson2?.city}
  locked={!!initialPerson2?.isDemo}
  secondaryCountry={person1.country}
  secondaryCity={person1.city}
  onConfirm={...}
  onSkip={...}
/>
```

**Step 4: Verify manually**

Start a conversation. Pick your country (Person 1). Advance to Person 2 picker. The map should now show Person 1's country highlighted, and as Person 2 picks their country, both pins appear with a dashed arc and a gold midpoint. The map pans to fit both.

**Step 5: Commit**

```bash
git add src/components/WatercolorMap.jsx src/components/CountryPicker.jsx src/components/EncounterFlow.jsx
git commit -m "feat: show live two-pin map with midpoint during country selection"
```

---

## Task 5: Voice to Text (Feature 3)

**Files:**
- Create: `src/components/VoiceButton.jsx`
- Modify: `src/components/EncounterFlow.jsx`

**Step 1: Create VoiceButton component**

```jsx
// src/components/VoiceButton.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { motion } from 'framer-motion'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export default function VoiceButton({ onTranscript, accentColor = 'terracotta' }) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  // Don't render if browser doesn't support it
  if (!SpeechRecognition) return null

  const accentHex = accentColor === 'sage' ? '#7A9E7E' : '#C4622D'

  const startListening = () => {
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('')
      onTranscript(transcript)
    }

    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  useEffect(() => () => recognitionRef.current?.stop(), [])

  return (
    <button
      type="button"
      onClick={listening ? stopListening : startListening}
      className="p-2 rounded-full transition-colors"
      style={{ color: listening ? accentHex : undefined }}
      title={listening ? 'Stop recording' : 'Speak your answer'}
    >
      {listening ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <MicOff size={16} style={{ color: accentHex }} />
        </motion.div>
      ) : (
        <Mic size={16} className="text-brown-deep/30 hover:text-brown-deep/60" />
      )}
    </button>
  )
}
```

**Step 2: Add VoiceButton to answer textareas in EncounterFlow**

In `src/components/EncounterFlow.jsx`, import VoiceButton and add it to both answer areas. Find the Answer 1 section and update:

```jsx
import VoiceButton from './VoiceButton'

// Answer 1 section — update the label row and add voice button:
<div className="space-y-2">
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
        {person1.city || person1.country || 'You'}
      </p>
      {person1.isDemo && (
        <span className="text-[10px] text-brown-deep/30 italic font-serif">example</span>
      )}
    </div>
    {!person1.isDemo && (
      <VoiceButton
        accentColor="terracotta"
        onTranscript={(t) => setAnswer1(t)}
      />
    )}
  </div>
  <textarea ... />
</div>

// Answer 2 section — same pattern with sage:
<div className="space-y-2">
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-sage">
        {person2.city || person2.country || 'Them'}
      </p>
      {person2.isDemo && (
        <span className="text-[10px] text-brown-deep/30 italic font-serif">example</span>
      )}
    </div>
    {!person2.isDemo && (
      <VoiceButton
        accentColor="sage"
        onTranscript={(t) => setAnswer2(t)}
      />
    )}
  </div>
  <textarea ... />
</div>
```

**Step 3: Verify manually**

Run the app. Start a conversation. On the question round, you should see a small mic icon next to each person's label. Clicking it should start recording (icon pulses). Speaking should populate the textarea. Clicking again should stop. The text should be editable after.

Test in Chrome (best support). In Firefox, the button won't appear — that's correct behavior.

**Step 4: Commit**

```bash
git add src/components/VoiceButton.jsx src/components/EncounterFlow.jsx
git commit -m "feat: add voice-to-text input using Web Speech API"
```

---

## Task 6: Serendipitous Email Follow-up (Feature 2)

**Files:**
- Modify: `src/components/HalfwayQuestion.jsx`
- Create: `api/schedule-followup.js`

**Step 1: Install Resend**

```bash
cd /Users/jeeminhan/Code/global-atlas
npm install resend
```

**Step 2: Create the Resend API handler**

```js
// api/schedule-followup.js
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Resend } from 'resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email1, email2, person1, person2, rounds, halfwayQuestion } = req.body

  // Generate a follow-up question
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `
Two people had a deep conversation. Here is what they shared:

Person 1 is from ${person1.city || ''}, ${person1.country}.
Person 2 is from ${person2.city || ''}, ${person2.country}.

Their conversation halfway question was: "${halfwayQuestion}"

${rounds.map(r => `On "${r.topic}": ${person1.city || person1.country} said "${r.answer1}" and ${person2.city || person2.country} said "${r.answer2}"`).join('\n')}

Generate ONE short follow-up question — something that would arrive a few weeks later and make both people think "how did it know to ask that?"

The question should:
- Reference something specific from their cultures or answers, unexpectedly
- Feel like a natural continuation — as if the conversation never really ended
- Be philosophical but personal — not abstract
- Be 1-2 sentences maximum

Return only the question. No preamble.
`

  let followUpQuestion = 'What if the conversation you had that day was actually the beginning of something — not just with each other, but in yourself?'

  try {
    const result = await model.generateContent([{ text: prompt }])
    followUpQuestion = result.response.text().trim()
  } catch {
    // Use fallback
  }

  // Schedule: random 1–30 days from now
  const daysFromNow = Math.floor(Math.random() * 30) + 1
  const scheduledAt = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString()

  const resend = new Resend(process.env.RESEND_API_KEY)

  const emailBody = `
<div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; color: #2C1810; background: #F5EFE0;">
  <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #9B7653; margin-bottom: 32px;">✦ Halfway — A follow-up</p>

  <p style="font-size: 14px; color: #2C1810; opacity: 0.5; margin-bottom: 8px;">${person1.city || person1.country} · ${person2.city || person2.country}</p>

  <p style="font-size: 13px; color: #2C1810; opacity: 0.4; margin-bottom: 40px; font-style: italic;">You asked each other: "${halfwayQuestion}"</p>

  <p style="font-size: 22px; font-style: italic; line-height: 1.5; color: #2C1810; border-left: 2px solid #C4622D; padding-left: 20px; margin-bottom: 40px;">
    "${followUpQuestion}"
  </p>

  <p style="font-size: 12px; color: #9B7653; opacity: 0.7;">This question arrived on its own schedule.</p>
</div>
`

  try {
    const emails = [email1, email2].filter(Boolean)
    await Promise.all(emails.map(email =>
      resend.emails.send({
        from: 'Halfway <hello@halfwayapp.co>',
        to: email,
        subject: `A question that waited ${daysFromNow} days`,
        html: emailBody,
        scheduledAt,
      })
    ))
    res.status(200).json({ scheduled: true, daysFromNow })
  } catch (err) {
    res.status(500).json({ error: 'scheduling_failed' })
  }
}
```

**Step 3: Add email capture to HalfwayQuestion**

After the halfway question reveals and the "Done →" button appears, add an optional email step. Update `HalfwayQuestion.jsx`:

```jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function HalfwayQuestion({ question, person1, person2, onSave }) {
  const [email1, setEmail1] = useState('')
  const [email2, setEmail2] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const cities = [person1?.city || person1?.country, person2?.city || person2?.country]
    .filter(Boolean).join(' · ')

  const handleSchedule = async () => {
    if (!email1 && !email2) { onSave(); return }
    setSubmitting(true)
    try {
      await fetch('/api/schedule-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email1, email2, person1, person2,
          rounds: [], halfwayQuestion: question }),
      })
    } catch { /* silent fail */ }
    setSubmitted(true)
    setSubmitting(false)
    setTimeout(onSave, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="relative flex flex-col items-center justify-center min-h-[85vh] text-center px-2"
    >
      {/* existing radial gradient background div — keep unchanged */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 45%, rgba(196, 98, 45, 0.08) 0%, transparent 70%)' }}
      />

      <div className="relative space-y-10 max-w-xs w-full">
        {cities && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="font-serif text-brown-deep/30 text-sm tracking-widest uppercase">
            {cities}
          </motion.p>
        )}

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sand">✦ Halfway Question</p>
          <p className="font-serif italic text-[1.55rem] text-brown-deep leading-snug">"{question}"</p>
        </motion.div>

        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 2.2, duration: 0.8 }}
          className="w-12 h-px bg-terracotta/30 mx-auto" />

        {/* Email follow-up section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.0 }}
          className="space-y-3 w-full">
          {!submitted ? (
            <>
              <p className="text-xs text-brown-deep/30 font-serif italic">
                Want a follow-up question in a few weeks?
              </p>
              <input
                type="email"
                value={email1}
                onChange={e => setEmail1(e.target.value)}
                placeholder={`${person1?.city || 'Your'} email (optional)`}
                className="w-full bg-paper-mid border border-sand/40 rounded-xl px-4 py-2.5 text-brown-deep placeholder:text-brown-deep/25 focus:outline-none focus:border-terracotta text-sm"
              />
              <input
                type="email"
                value={email2}
                onChange={e => setEmail2(e.target.value)}
                placeholder={`${person2?.city || 'Their'} email (optional)`}
                className="w-full bg-paper-mid border border-sand/40 rounded-xl px-4 py-2.5 text-brown-deep placeholder:text-brown-deep/25 focus:outline-none focus:border-sage text-sm"
              />
              <button
                onClick={handleSchedule}
                disabled={submitting}
                className="w-full font-serif italic text-brown-deep/40 text-sm hover:text-brown-deep/70 transition-colors py-1 disabled:opacity-40"
              >
                {submitting ? 'Scheduling...' : email1 || email2 ? 'Send it someday →' : 'Done →'}
              </button>
            </>
          ) : (
            <p className="font-serif italic text-brown-deep/40 text-sm">
              It'll arrive when it's ready. ✦
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
```

**Step 4: Set up Resend**
1. Go to resend.com, create a free account
2. Get your API key from the dashboard
3. Add `RESEND_API_KEY=re_xxxxx` to `.env.local` (for local dev) and to Vercel environment variables
4. Update the `from` address to a domain you own, or use Resend's sandbox for testing (`onboarding@resend.dev`)

**Step 5: Verify manually**

Run the app. Complete a conversation. The halfway question screen should now show two optional email fields below the "Done →" button. Enter an email and click "Send it someday →". Check Resend dashboard to confirm a scheduled email was queued.

**Step 6: Commit**

```bash
git add api/schedule-followup.js src/components/HalfwayQuestion.jsx package.json package-lock.json
git commit -m "feat: add serendipitous email follow-up with Resend scheduled delivery"
```

---

## Task 7: Community Feed Demo (Feature 6)

**Files:**
- Create: `src/components/CommunityFeed.jsx`
- Modify: `src/components/ConversationHistory.jsx`

**Step 1: Create CommunityFeed with mock data**

```jsx
// src/components/CommunityFeed.jsx
import React, { useState } from 'react'
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'

const REACTIONS = ['✦', '🌊', '🍂', '🌙', '💬']

const MOCK_STORIES = [
  {
    id: 'mock-1',
    person1: { city: 'Lagos', country: 'Nigeria' },
    person2: { city: 'Seoul', country: 'South Korea' },
    topics: [
      { icon: '🍂', name: 'Loss' },
      { icon: '🌊', name: 'Belonging' },
      { icon: '🌙', name: 'The Unknown' },
    ],
    halfwayQuestion: 'Is there a person who could hold both the noise of Lagos and the silence of Seoul at once — and know that both are yours?',
    reactions: { '✦': 41, '🌊': 28, '🍂': 19, '🌙': 33, '💬': 12 },
    comments: [
      { id: 'c1', text: 'This question sat with me for days.', city: 'Nairobi' },
      { id: 'c2', text: 'The noise and the silence — I felt this immediately.', city: 'Busan' },
    ],
  },
  {
    id: 'mock-2',
    person1: { city: 'Karachi', country: 'Pakistan' },
    person2: { city: 'São Paulo', country: 'Brazil' },
    topics: [
      { icon: '🍂', name: 'Loss' },
      { icon: '🌊', name: 'Belonging' },
      { icon: '✨', name: 'Home' },
    ],
    halfwayQuestion: 'What if the thing you\'re both grieving isn\'t a place — it\'s a version of yourself that only existed there?',
    reactions: { '✦': 67, '🌊': 44, '🍂': 55, '🌙': 22, '💬': 18 },
    comments: [
      { id: 'c3', text: '"A version of yourself that only existed there" — I\'ve never heard this named before.', city: 'Mexico City' },
    ],
  },
  {
    id: 'mock-3',
    person1: { city: 'Cairo', country: 'Egypt' },
    person2: { city: 'Mexico City', country: 'Mexico' },
    topics: [
      { icon: '🌙', name: 'The Unknown' },
      { icon: '🌊', name: 'Belonging' },
      { icon: '🍂', name: 'Loss' },
    ],
    halfwayQuestion: 'Could a person know you the way the call to prayer knows Cairo and the way the Zócalo holds Mexico City — completely, and without needing you to explain?',
    reactions: { '✦': 38, '🌊': 29, '🍂': 17, '🌙': 51, '💬': 9 },
    comments: [],
  },
  {
    id: 'mock-4',
    person1: { city: 'Nairobi', country: 'Kenya' },
    person2: { city: 'Reykjavik', country: 'Iceland' },
    topics: [
      { icon: '✨', name: 'Home' },
      { icon: '🍂', name: 'Loss' },
      { icon: '🌊', name: 'Belonging' },
    ],
    halfwayQuestion: 'Is there someone who could be both the warmth of a Nairobi afternoon and the clarity of a Reykjavik winter — and not make you choose which one you are?',
    reactions: { '✦': 92, '🌊': 63, '🍂': 45, '🌙': 71, '💬': 31 },
    comments: [
      { id: 'c4', text: 'I read this three times before I moved on.', city: 'Oslo' },
      { id: 'c5', text: 'This is the best question I\'ve ever read.', city: 'Kampala' },
      { id: 'c6', text: 'The warmth and the clarity. Both are mine.', city: 'Akureyri' },
    ],
  },
]

function StoryCard({ story }) {
  const [reactions, setReactions] = useState(story.reactions)
  const [comments, setComments] = useState(story.comments)
  const [commentText, setCommentText] = useState('')
  const [cityText, setCityText] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [myReaction, setMyReaction] = useState(null)

  const handleReact = (emoji) => {
    if (myReaction === emoji) {
      setReactions(r => ({ ...r, [emoji]: r[emoji] - 1 }))
      setMyReaction(null)
    } else {
      if (myReaction) setReactions(r => ({ ...r, [myReaction]: r[myReaction] - 1 }))
      setReactions(r => ({ ...r, [emoji]: r[emoji] + 1 }))
      setMyReaction(emoji)
    }
  }

  const handleComment = () => {
    if (!commentText.trim()) return
    setComments(c => [...c, {
      id: `local-${Date.now()}`,
      text: commentText.trim(),
      city: cityText.trim() || null,
    }])
    setCommentText('')
    setCityText('')
  }

  return (
    <div className="ink-card border border-sand/30 overflow-hidden">
      {/* Header */}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-widest text-terracotta bg-terracotta/8 px-2 py-0.5 rounded-full">
            {story.person1.city}, {story.person1.country}
          </span>
          <span className="text-brown-deep/20 text-xs">×</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-sage bg-sage/10 px-2 py-0.5 rounded-full">
            {story.person2.city}, {story.person2.country}
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {story.topics.map((t, i) => (
            <span key={i} className="text-xs bg-sand/20 text-brown-deep/55 px-2 py-1 rounded-full">
              {t.icon} {t.name}
            </span>
          ))}
        </div>

        <p className="font-serif italic text-brown-deep text-base leading-relaxed border-l-2 border-terracotta/30 pl-3">
          "{story.halfwayQuestion}"
        </p>
      </div>

      {/* Reactions */}
      <div className="px-5 pb-3 flex gap-2 flex-wrap">
        {REACTIONS.map(emoji => (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-colors ${
              myReaction === emoji
                ? 'bg-terracotta/15 border-terracotta/40 text-terracotta'
                : 'bg-sand/10 border-sand/30 text-brown-deep/50 hover:border-sand/60'
            }`}
          >
            <span>{emoji}</span>
            <span>{reactions[emoji]}</span>
          </button>
        ))}
      </div>

      {/* Comments toggle */}
      <div className="border-t border-sand/20">
        <button
          onClick={() => setShowComments(s => !s)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs text-brown-deep/40 hover:text-brown-deep/60 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <MessageCircle size={12} />
            {comments.length} {comments.length === 1 ? 'reflection' : 'reflections'}
          </span>
          {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showComments && (
          <div className="px-5 pb-4 space-y-3">
            {comments.map(c => (
              <div key={c.id} className="space-y-0.5">
                {c.city && (
                  <p className="text-[10px] uppercase tracking-widest text-brown-deep/30 font-semibold">{c.city}</p>
                )}
                <p className="text-sm text-brown-deep/65 font-serif italic leading-relaxed">"{c.text}"</p>
              </div>
            ))}

            {/* Add comment */}
            <div className="space-y-2 pt-2 border-t border-sand/20">
              <input
                value={cityText}
                onChange={e => setCityText(e.target.value)}
                placeholder="Your city (optional)"
                className="w-full bg-paper-mid border border-sand/40 rounded-xl px-3 py-2 text-brown-deep placeholder:text-brown-deep/25 focus:outline-none focus:border-terracotta text-xs"
              />
              <div className="flex gap-2">
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Leave a reflection..."
                  rows={2}
                  className="flex-1 bg-paper-mid border border-sand/40 rounded-xl px-3 py-2 text-brown-deep placeholder:text-brown-deep/25 focus:outline-none focus:border-terracotta resize-none text-xs"
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  className="px-3 py-2 bg-brown-deep text-parchment rounded-xl text-xs font-semibold disabled:opacity-30 self-end"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CommunityFeed() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-brown-deep/30 font-serif italic text-center py-2">
        Real conversations. Shared anonymously.
      </p>
      {MOCK_STORIES.map(story => (
        <StoryCard key={story.id} story={story} />
      ))}
      <p className="text-xs text-brown-deep/20 font-serif italic text-center pb-4">
        (Demo — backend coming soon)
      </p>
    </div>
  )
}
```

**Step 2: Add toggle to ConversationHistory**

Update `src/components/ConversationHistory.jsx`:

```jsx
import CommunityFeed from './CommunityFeed'

export default function ConversationHistory({ conversations, onBack }) {
  const [view, setView] = useState('mine') // 'mine' | 'community'

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-paper-mid transition-colors">
          <ArrowLeft size={18} className="text-brown-deep/50" />
        </button>
        <h1 className="font-serif text-xl font-bold text-brown-deep">
          {view === 'mine' ? 'Past Conversations' : 'Community'}
        </h1>
      </div>

      {/* Toggle */}
      <div className="px-6 mb-4 max-w-md mx-auto">
        <div className="flex bg-paper-mid rounded-2xl p-1 gap-1">
          <button
            onClick={() => setView('mine')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              view === 'mine' ? 'bg-parchment text-brown-deep shadow-sm' : 'text-brown-deep/40'
            }`}
          >
            My Conversations
          </button>
          <button
            onClick={() => setView('community')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              view === 'community' ? 'bg-parchment text-brown-deep shadow-sm' : 'text-brown-deep/40'
            }`}
          >
            Community
          </button>
        </div>
      </div>

      <div className="px-6 pb-10 space-y-4 max-w-md mx-auto">
        {view === 'community' ? (
          <CommunityFeed />
        ) : conversations.length === 0 ? (
          <p className="font-serif italic text-brown-deep/30 text-center mt-20 text-lg">
            No conversations yet.
          </p>
        ) : (
          <>
            <HistoryMap conversations={conversations} />
            {conversations.map(convo => (
              <ConvoCard key={convo.id} convo={convo} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Add useState import**

Make sure `useState` is imported in ConversationHistory.jsx (it may already be there). Add `import HistoryMap from './HistoryMap'` as well.

**Step 4: Verify manually**

Go to Past Conversations. A toggle should appear at the top: "My Conversations" / "Community". Switching to Community shows 4 story cards with city pairs, halfway questions, reaction buttons, and collapsible comment threads. Reactions update counts on click. Comments can be added and appear immediately.

**Step 5: Commit**

```bash
git add src/components/CommunityFeed.jsx src/components/ConversationHistory.jsx
git commit -m "feat: add community feed demo with reactions and anonymous comments"
```

---

## Final Verification

Run `npm run build` — should complete with no errors:

```bash
cd /Users/jeeminhan/Code/global-atlas
npm run build
```

Then run `npm run preview` and walk through the full app flow:
1. Onboarding shows 4 slides (new bridge intro first)
2. Start a conversation — Person 2 picker shows both pins on map
3. Answer questions using voice or typing
4. Halfway question screen shows email capture fields
5. Past Conversations shows map + toggle
6. Community tab shows 4 mock stories with reactions and comments
