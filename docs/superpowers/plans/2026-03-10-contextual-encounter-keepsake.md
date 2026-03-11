# Contextual Encounter & Keepsake Summary Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Halfway's per-round text input with setting/occupation context pickers, ambient voice recording, and a rich AI-generated keepsake artifact.

**Architecture:** Six new steps are inserted into `EncounterFlow`'s step state machine (`setting`, `who-you-occupation`, `who-them-occupation`, `recording`, `processing`, `keepsake`), replacing the existing `round`/`generating`/`halfway` steps. Two new picker components collect context, one new recording component captures audio via `MediaRecorder`, and two API changes (one enriched, one new) produce the keepsake JSON using Gemini.

**Tech Stack:** React 18, Framer Motion 11, Tailwind CSS, Gemini 2.0 Flash via `@google/generative-ai`, `MediaRecorder` browser API, Vercel serverless functions, localStorage for persistence.

**Note on testing:** This project has no test framework configured. Each task includes manual browser verification steps with specific things to check. All verification must be done in the dev server (`npm run dev`).

**Known sequencing constraint:** Task 9 (delete old files) MUST run after Task 3 (EncounterFlow rewrite) is committed. Task 3 removes the imports of `VoiceButton` and `HalfwayQuestion` from EncounterFlow. If Task 9 runs before Task 3, the app will fail to compile.

**Demo mode note:** `App.jsx` passes `initialPerson1={isDemo: true}` and `initialPerson2={isDemo: true}` for demo mode. The new flow always starts at `setting` regardless. Demo users will go through SettingPicker normally, then CountryPicker screens are locked (existing behavior). The demo skip on the `who-them` CountryPicker uses a hardcoded demo person2 — update it to also include `occupation: 'student'` when constructing the demo person.

**FALLBACK_KEEPSAKE shape** (used in EncounterFlow when summarize-conversation API fails twice):
```js
const FALLBACK_KEEPSAKE = {
  thread: "Something happened here that words can't quite hold.",
  person1Window: '',
  person2Window: '',
  reflection: "What if the thing you're both homesick for isn't actually a place?",
  continuePrompt: 'Stay in touch.',
}
```

**convo.topics shape** (what gets saved to localStorage): The `displayTopics` array saved as `convo.topics` has the same shape as the base `topics` array from `topics.js` (fields: `id`, `icon`, `name`, `question`, `color`) plus optional `question1`/`question2` from AI enrichment. `ConversationHistory` backward-compat code should use `r.icon` and `r.name` for new topics, `r.topicObj?.icon` and `r.topic` for legacy rounds.

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/components/SettingPicker.jsx` | Animated card grid for shared setting selection |
| Create | `src/components/OccupationPicker.jsx` | Animated card grid for per-person occupation |
| Create | `src/components/RecordingScreen.jsx` | MediaRecorder UI with topic prompts |
| Create | `src/components/KeepsakeSummary.jsx` | Final keepsake artifact display |
| Create | `api/summarize-conversation.js` | New Gemini endpoint — audio or text → keepsake JSON |
| Modify | `src/components/EncounterFlow.jsx` | New steps, state, component wiring; remove old round/halfway logic |
| Modify | `api/generate-topics.js` | Add setting/occupation inputs; directional questions |
| Modify | `src/components/ConversationHistory.jsx` | Render `keepsake.thread` instead of `halfwayQuestion` |
| Delete | `src/components/HalfwayQuestion.jsx` | Replaced by KeepsakeSummary |
| Delete | `src/components/VoiceButton.jsx` | Replaced by RecordingScreen |
| Delete | `api/halfway-question.js` | Replaced by summarize-conversation.js |

---

## Chunk 1: Context Picker Components

### Task 1: Create SettingPicker

**Files:**
- Create: `src/components/SettingPicker.jsx`

- [ ] **Step 1.1: Create SettingPicker**

```jsx
// src/components/SettingPicker.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SETTINGS = [
  { id: 'campus', icon: '🏫', label: 'Campus' },
  { id: 'cafe', icon: '☕', label: 'Café' },
  { id: 'library', icon: '📚', label: 'Library' },
  { id: 'church', icon: '⛪', label: 'Church' },
  { id: 'park', icon: '🌳', label: 'Park' },
  { id: 'office', icon: '🏢', label: 'Office' },
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'hospital', icon: '🏥', label: 'Hospital' },
]

export default function SettingPicker({ onConfirm }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="h-screen bg-parchment flex flex-col px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-serif text-3xl font-bold text-brown-deep mb-1">Where are you?</h1>
        <p className="text-brown-deep/50 text-sm italic">This shapes what you'll ask each other.</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 flex-1 content-start">
        {SETTINGS.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => setSelected(s.id)}
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl py-6 border-2 transition-all ${
              selected === s.id
                ? 'border-terracotta bg-terracotta/10 scale-[1.02]'
                : 'border-sand/40 bg-paper-mid hover:border-terracotta/30'
            }`}
          >
            <span className="text-3xl">{s.icon}</span>
            <span className="text-sm font-semibold text-brown-deep">{s.label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => onConfirm(selected)}
            className="mt-6 w-full bg-brown-deep text-parchment py-4 rounded-2xl font-semibold hover:bg-brown-deep/90 transition-colors"
          >
            Continue →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 1.2: Verify manually**

Run: `npm run dev`

Open the app in a browser. Temporarily add `<SettingPicker onConfirm={console.log} />` to `App.jsx` to preview the component. Check:
- 8 cards animate in with stagger delay
- Tapping a card highlights it (terracotta border + scale)
- "Continue →" button appears after selection
- Clicking Continue logs the setting ID to console
- Remove the temporary code from App.jsx after verifying

- [ ] **Step 1.3: Commit**

```bash
cd /Users/jeeminhan/code/global-atlas
git add src/components/SettingPicker.jsx
git commit -m "feat: add SettingPicker component with animated card grid"
```

---

### Task 2: Create OccupationPicker

**Files:**
- Create: `src/components/OccupationPicker.jsx`

- [ ] **Step 2.1: Create OccupationPicker**

```jsx
// src/components/OccupationPicker.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const OCCUPATIONS = [
  { id: 'student', icon: '🎓', label: 'Student' },
  { id: 'researcher', icon: '🔬', label: 'Researcher' },
  { id: 'professional', icon: '💼', label: 'Professional' },
  { id: 'volunteer', icon: '🤝', label: 'Volunteer' },
  { id: 'ministry', icon: '✝️', label: 'Ministry' },
  { id: 'service', icon: '🍳', label: 'Service' },
  { id: 'tech', icon: '👩‍💻', label: 'Tech' },
  { id: 'creative', icon: '🎨', label: 'Creative' },
]

export default function OccupationPicker({ label, accentColor = 'terracotta', onConfirm }) {
  const [selected, setSelected] = useState(null)

  const selectedClass = accentColor === 'sage'
    ? 'border-sage bg-sage/10'
    : 'border-terracotta bg-terracotta/10'

  const btnBg = accentColor === 'sage'
    ? 'bg-sage hover:bg-sage/90'
    : 'bg-terracotta hover:bg-terracotta/90'

  return (
    <div className="h-screen bg-parchment flex flex-col px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-serif text-3xl font-bold text-brown-deep mb-1">
          What does {label} do?
        </h1>
        <p className="text-brown-deep/50 text-sm italic">Helps us shape the right questions.</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 flex-1 content-start">
        {OCCUPATIONS.map((o, i) => (
          <motion.button
            key={o.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => setSelected(o.id)}
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl py-6 border-2 transition-all ${
              selected === o.id
                ? `${selectedClass} scale-[1.02]`
                : 'border-sand/40 bg-paper-mid hover:border-sand/60'
            }`}
          >
            <span className="text-3xl">{o.icon}</span>
            <span className="text-sm font-semibold text-brown-deep">{o.label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => onConfirm(selected)}
            className={`mt-6 w-full ${btnBg} text-parchment py-4 rounded-2xl font-semibold transition-colors`}
          >
            Continue →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 2.2: Verify manually**

Temporarily render `<OccupationPicker label="Seoul" accentColor="terracotta" onConfirm={console.log} />` and then `<OccupationPicker label="Lagos" accentColor="sage" onConfirm={console.log} />` in App.jsx. Check:
- Terracotta variant: selected card has orange border
- Sage variant: selected card has green border, Continue button is green
- Cards stagger in correctly
- Remove temporary code after verifying

- [ ] **Step 2.3: Commit**

```bash
git add src/components/OccupationPicker.jsx
git commit -m "feat: add OccupationPicker component with per-person accent colors"
```

---

## Chunk 2: EncounterFlow Rewire

### Task 3: Rewrite EncounterFlow with new steps

**Files:**
- Modify: `src/components/EncounterFlow.jsx`

This is a full replacement of EncounterFlow. The old component had: `who-you`, `who-them`, `loading-topics`, `round` (×3), `generating`, `halfway` steps plus extensive round state. The new component has: `setting`, `who-you`, `who-you-occupation`, `who-them`, `who-them-occupation`, `loading-topics`, `recording`, `processing`, `keepsake`.

- [ ] **Step 3.1: Replace EncounterFlow**

```jsx
// src/components/EncounterFlow.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { drawTopics } from '../data/topics'
import SettingPicker from './SettingPicker'
import OccupationPicker from './OccupationPicker'
import CountryPicker from './CountryPicker'
import RecordingScreen from './RecordingScreen'
import KeepsakeSummary from './KeepsakeSummary'

const FALLBACK_KEEPSAKE = {
  thread: "Something happened here that words can't quite hold.",
  person1Window: '',
  person2Window: '',
  reflection: "What if the thing you're both homesick for isn't actually a place?",
  continuePrompt: 'Stay in touch.',
}

export default function EncounterFlow({ initialPerson1, initialPerson2, onSave, onClose }) {
  const [step, setStep] = useState('setting')
  const [setting, setSetting] = useState(null)
  const [person1, setPerson1] = useState(initialPerson1 || { city: '', country: '', occupation: '' })
  const [person2, setPerson2] = useState(initialPerson2 || { city: '', country: '', occupation: '' })
  const [topics] = useState(() => drawTopics(3))
  const [enrichedTopics, setEnrichedTopics] = useState(null)
  const [keepsake, setKeepsake] = useState(null)

  const displayTopics = enrichedTopics || topics

  const handleGenerateTopics = async (p1, p2, s, drawnTopics) => {
    setStep('loading-topics')
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch('/api/generate-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          person1City: p1.city,
          person1Country: p1.country,
          person1Occupation: p1.occupation,
          person2City: p2.city,
          person2Country: p2.country,
          person2Occupation: p2.occupation,
          setting: s,
          topics: drawnTopics.map(t => ({ id: t.id, name: t.name })),
        }),
      })
      clearTimeout(timeout)
      const data = await res.json()
      if (data.questions && data.questions.length >= 3) {
        const enriched = drawnTopics.map(t => {
          const found = data.questions.find(q => q.id === t.id)
          return found ? { ...t, question1: found.question1, question2: found.question2 } : t
        })
        setEnrichedTopics(enriched)
      }
    } catch {
      // fall back to default topics
    }
    setStep('recording')
  }

  const handleRecordingFinish = async (recordingData) => {
    if (recordingData.discard) {
      // Clear enrichedTopics so topic generation re-runs when they return
      setEnrichedTopics(null)
      setStep('who-them-occupation')
      return
    }
    setStep('processing')

    const save = (k) => {
      onSave({
        id: `convo-${Date.now()}`,
        person1,
        person2,
        setting,
        topics: displayTopics,
        keepsake: k,
        createdAt: new Date().toISOString(),
      })
      setKeepsake(k)
      setStep('keepsake')
    }

    const attempt = async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch('/api/summarize-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          ...recordingData,
          setting,
          person1: { city: person1.city, country: person1.country, occupation: person1.occupation },
          person2: { city: person2.city, country: person2.country, occupation: person2.occupation },
        }),
      })
      clearTimeout(timeout)
      const data = await res.json()
      if (!data.thread) throw new Error('Invalid response')
      return data
    }

    try {
      save(await attempt())
    } catch {
      try {
        save(await attempt())
      } catch {
        save(FALLBACK_KEEPSAKE)
      }
    }
  }

  const loadingDots = (
    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-terracotta/50"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </div>
      <p className="font-serif italic text-brown-deep/40 text-sm">
        {step === 'loading-topics' ? 'Reading your worlds…' : 'Finding your halfway point…'}
      </p>
    </div>
  )

  return (
    <div className="h-screen bg-parchment flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'setting' && (
          <motion.div key="setting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
            <SettingPicker onConfirm={(s) => { setSetting(s); setStep('who-you') }} />
          </motion.div>
        )}

        {step === 'who-you' && (
          <motion.div key="who-you" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0">
            <CountryPicker
              label="You"
              accentColor="terracotta"
              initialCountry={initialPerson1?.country}
              initialCity={initialPerson1?.city}
              locked={!!initialPerson1?.isDemo}
              onConfirm={(data) => {
                setPerson1(p => ({ ...p, country: data.country, city: data.city }))
                setStep('who-you-occupation')
              }}
            />
          </motion.div>
        )}

        {step === 'who-you-occupation' && (
          <motion.div key="who-you-occupation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1">
            <OccupationPicker
              label={person1.city || person1.country || 'you'}
              accentColor="terracotta"
              onConfirm={(occ) => {
                setPerson1(p => ({ ...p, occupation: occ }))
                setStep('who-them')
              }}
            />
          </motion.div>
        )}

        {step === 'who-them' && (
          <motion.div key="who-them" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0">
            <CountryPicker
              label="Them"
              accentColor="sage"
              secondaryCountry={person1.country}
              secondaryCity={person1.city}
              onConfirm={(data) => {
                setPerson2(p => ({ ...p, country: data.country, city: data.city }))
                setStep('who-them-occupation')
              }}
              onSkip={initialPerson2 ? undefined : () => {
                // Demo person — include occupation so API has full context
                const demo = { country: 'Canada', city: 'Toronto', occupation: 'student', isDemo: true }
                setPerson2(demo)
                handleGenerateTopics(person1, demo, setting, topics)
              }}
            />
          </motion.div>
        )}

        {step === 'who-them-occupation' && (
          <motion.div key="who-them-occupation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1">
            <OccupationPicker
              label={person2.city || person2.country || 'them'}
              accentColor="sage"
              onConfirm={(occ) => {
                const p2 = { ...person2, occupation: occ }
                setPerson2(p2)
                handleGenerateTopics(person1, p2, setting, topics)
              }}
            />
          </motion.div>
        )}

        {(step === 'loading-topics' || step === 'processing') && (
          <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
            {loadingDots}
          </motion.div>
        )}

        {step === 'recording' && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
            <RecordingScreen
              topics={displayTopics}
              person1={person1}
              person2={person2}
              onFinish={handleRecordingFinish}
              onClose={onClose}
            />
          </motion.div>
        )}

        {step === 'keepsake' && keepsake && (
          <motion.div key="keepsake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto">
            <KeepsakeSummary
              keepsake={keepsake}
              person1={person1}
              person2={person2}
              onClose={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 3.2: Verify the flow compiles**

Run: `npm run dev`

Expected: no console errors, no build errors. The app should load. Navigate to an encounter from the home screen. You should see the SettingPicker as the first screen (it will error at RecordingScreen since that doesn't exist yet — that's OK at this stage, the compile is what matters).

- [ ] **Step 3.3: Commit**

```bash
git add src/components/EncounterFlow.jsx
git commit -m "feat: rewire EncounterFlow with setting/occupation/recording/keepsake steps"
```

---

## Chunk 3: API — Enriched Topic Generation

### Task 4: Update generate-topics.js for directional questions

**Files:**
- Modify: `api/generate-topics.js`

- [ ] **Step 4.1: Replace generate-topics.js**

```js
// api/generate-topics.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    person1City, person1Country, person1Occupation,
    person2City, person2Country, person2Occupation,
    setting,
    topics,
  } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are generating conversation questions for two people who just met.

Context:
- Setting: ${setting || 'unknown'}
- Person 1 is from ${person1City || ''}${person1Country ? ', ' + person1Country : ''}, occupation: ${person1Occupation || 'unknown'}
- Person 2 is from ${person2City || ''}${person2Country ? ', ' + person2Country : ''}, occupation: ${person2Occupation || 'unknown'}

Generate TWO directional questions for each of these ${topics.length} topics: ${topics.map(t => t.name).join(', ')}

For each topic:
- question1: Asked TO Person 1 (from ${person1City || person1Country}). Invites them to share something about their world that helps Person 2 understand it better.
- question2: Asked TO Person 2 (from ${person2City || person2Country}). Invites them to share something about their world that helps Person 1 understand it better.

For each question:
- Reference something culturally specific to that person's city/country — an actual place, tradition, food, ritual, or social norm
- Frame it with warmth and specificity — "Growing up in Lagos..." or "In Seoul..." not "In your culture..."
- Let the surface be cultural but the underneath probe toward: longing, permanence, being fully known, or something that never leaves
- Reflect their occupation and setting naturally — a student at a campus asks differently than a professional in an office
- Be a single conversational question (not an interview prompt)

Return a JSON array with exactly ${topics.length} objects:
[
  { "id": "topic-id", "question1": "...", "question2": "..." },
  ...
]
Return only the JSON array. No preamble, no markdown code fences.
`;

  try {
    const result = await model.generateContent([{ text: prompt }]);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const questions = JSON.parse(cleaned);
    res.status(200).json({ questions });
  } catch (err) {
    res.status(500).json({ error: "generation_failed" });
  }
}
```

- [ ] **Step 4.2: Verify the API**

Run a curl test (with your local Vercel dev server — `vercel dev` or `npm run dev` if using Vite proxy):

```bash
curl -X POST http://localhost:3000/api/generate-topics \
  -H "Content-Type: application/json" \
  -d '{
    "person1City": "Seoul",
    "person1Country": "South Korea",
    "person1Occupation": "student",
    "person2City": "Lagos",
    "person2Country": "Nigeria",
    "person2Occupation": "student",
    "setting": "campus",
    "topics": [
      {"id": "loss", "name": "Loss"},
      {"id": "belonging", "name": "Belonging"},
      {"id": "home", "name": "Home"}
    ]
  }'
```

Expected: JSON array with 3 objects, each with `id`, `question1`, `question2`. The questions should reference Seoul/Lagos specifically and feel directional.

- [ ] **Step 4.3: Commit**

```bash
git add api/generate-topics.js
git commit -m "feat: update generate-topics with setting/occupation context and directional questions"
```

---

## Chunk 4: Recording Screen

### Task 5: Create RecordingScreen

**Files:**
- Create: `src/components/RecordingScreen.jsx`

- [ ] **Step 5.1: Create RecordingScreen**

```jsx
// src/components/RecordingScreen.jsx
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square } from 'lucide-react'

const MAX_SECONDS = 5 * 60  // 5 minutes
const WARN_AT = 4 * 60       // warn at 4 minutes

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function RecordingScreen({ topics, person1, person2, onFinish, onClose }) {
  const [hasRecorder] = useState(() =>
    typeof MediaRecorder !== 'undefined' && !!navigator?.mediaDevices?.getUserMedia
  )
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [fallbackText, setFallbackText] = useState('')
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.start(1000)
      setRecording(true)
      setElapsed(0)

      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev + 1 >= MAX_SECONDS) {
            stopRecording()
            return MAX_SECONDS
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      console.error('Microphone access denied:', err)
    }
  }

  const stopRecording = () => {
    clearInterval(intervalRef.current)
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    setRecording(false)
    setHasRecorded(true)
  }

  const handleFinish = async () => {
    if (hasRecorder && chunksRef.current.length > 0) {
      // Wait for final ondataavailable chunk
      await new Promise(r => setTimeout(r, 300))
      const mimeType = recorderRef.current?.mimeType || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type: mimeType })
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]
        onFinish({ audioBase64: base64, audioMimeType: mimeType })
      }
      reader.readAsDataURL(blob)
    } else if (!hasRecorder && fallbackText.trim()) {
      onFinish({ transcript: fallbackText.trim() })
    }
  }

  const handleBackRequest = () => {
    if (recording) stopRecording()
    setShowBackConfirm(true)
  }

  const canFinish = hasRecorder
    ? (hasRecorded && chunksRef.current.length > 0)
    : fallbackText.trim().length > 10

  return (
    <div className="h-screen bg-parchment flex flex-col relative">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 shrink-0">
        <span className="font-serif text-lg font-bold text-brown-deep">Halfway</span>
        <button
          onClick={handleBackRequest}
          className="p-2 rounded-full hover:bg-paper-mid transition-colors"
        >
          <span className="text-brown-deep/40 text-sm">✕</span>
        </button>
      </div>

      {/* Topic prompts */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">
        {topics.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-5 border"
            style={{
              background: `linear-gradient(135deg, ${topic.color}14 0%, #EDE5D0 65%)`,
              borderColor: topic.color + '30',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{topic.icon}</span>
              <span className="font-serif font-bold text-brown-deep text-sm">{topic.name}</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-terracotta mb-1">
                  {person1.city || person1.country || 'You'}
                </p>
                <p className="font-serif italic text-brown-deep/70 text-sm leading-relaxed">
                  "{topic.question1 || topic.question}"
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-1">
                  {person2.city || person2.country || 'Them'}
                </p>
                <p className="font-serif italic text-brown-deep/70 text-sm leading-relaxed">
                  "{topic.question2 || topic.question}"
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Text fallback */}
        {!hasRecorder && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-brown-deep/50 italic">
              Voice recording isn't available on this browser. Type a summary of your conversation instead.
            </p>
            <textarea
              value={fallbackText}
              onChange={e => setFallbackText(e.target.value)}
              placeholder="What did you talk about?"
              rows={5}
              className="w-full bg-paper-mid border border-sand/40 rounded-xl p-3 text-brown-deep placeholder:text-brown-deep/25 focus:outline-none focus:border-terracotta resize-none text-sm"
            />
          </div>
        )}
      </div>

      {/* Recording controls */}
      {hasRecorder && (
        <div className="px-6 pt-2 shrink-0">
          <AnimatePresence>
            {elapsed >= WARN_AT && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-brown-deep/40 italic mb-2"
              >
                Wrapping up soon…
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-center gap-6 mb-3">
            <span className="font-mono text-sm text-brown-deep/40 w-12 text-right">
              {formatTime(elapsed)}
            </span>

            {!recording ? (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-terracotta flex items-center justify-center shadow-lg"
              >
                <Mic size={24} className="text-parchment" />
              </motion.button>
            ) : (
              <motion.button
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                whileTap={{ scale: 0.92 }}
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-brown-deep flex items-center justify-center shadow-lg"
              >
                <Square size={20} className="text-parchment fill-parchment" />
              </motion.button>
            )}

            <span className="w-12" />
          </div>
        </div>
      )}

      {/* Finish button */}
      <div className="px-6 pb-8 shrink-0">
        <button
          onClick={handleFinish}
          disabled={!canFinish}
          className="w-full bg-brown-deep text-parchment py-4 rounded-2xl font-semibold disabled:opacity-30 hover:bg-brown-deep/90 transition-colors"
        >
          Finish Conversation →
        </button>
      </div>

      {/* Back confirmation overlay */}
      <AnimatePresence>
        {showBackConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brown-deep/60 flex items-end z-50"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full bg-parchment rounded-t-3xl p-6 space-y-4"
            >
              <p className="font-serif text-lg font-bold text-brown-deep text-center">
                Discard this recording?
              </p>
              <p className="text-brown-deep/60 text-sm text-center">
                Your conversation won't be saved.
              </p>
              <button
                onClick={() => onFinish({ discard: true })}
                className="w-full bg-brown-deep text-parchment py-3 rounded-2xl font-semibold"
              >
                Yes, discard
              </button>
              <button
                onClick={() => setShowBackConfirm(false)}
                className="w-full text-brown-deep/50 py-3 text-sm"
              >
                Keep recording
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 5.2: Verify RecordingScreen manually**

Run through the full flow from the app:
1. Start encounter → pick setting → pick your country + occupation → pick their country + occupation
2. Wait for `loading-topics` to resolve → RecordingScreen should appear
3. Check 3 topic cards render with both `question1` and `question2` labels
4. Tap mic button → browser asks for microphone permission → grant it
5. Record a few seconds of speech → stop → "Finish Conversation →" button becomes enabled
6. Tap finish → should advance to `processing` then `keepsake` (keepsake screen will error since KeepsakeSummary doesn't exist yet — that's OK)

Also test on a browser where MediaRecorder is unavailable (or temporarily set `const [hasRecorder] = useState(() => false)`) to verify the fallback textarea appears.

- [ ] **Step 5.3: Commit**

```bash
git add src/components/RecordingScreen.jsx
git commit -m "feat: add RecordingScreen with MediaRecorder, 5-min timer, and text fallback"
```

---

## Chunk 5: Summarize Conversation API

### Task 6: Create summarize-conversation.js

**Files:**
- Create: `api/summarize-conversation.js`

- [ ] **Step 6.1: Create the API**

```js
// api/summarize-conversation.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    audioBase64,
    audioMimeType,
    transcript,
    setting,
    person1,
    person2,
  } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const context = [
    `Setting: ${setting || 'unknown'}`,
    `Person 1 is from ${[person1.city, person1.country].filter(Boolean).join(', ')}, occupation: ${person1.occupation || 'unknown'}`,
    `Person 2 is from ${[person2.city, person2.country].filter(Boolean).join(', ')}, occupation: ${person2.occupation || 'unknown'}`,
  ].join('\n')

  const outputInstructions = `
From this conversation, generate a keepsake JSON object with exactly these fields:

- "thread": The ONE specific thing — a word, image, memory, feeling — that appeared in both their worlds. Name it using their actual words. 1-2 sentences. Specific, not abstract. If no clear shared thread, create a poetic bridge between the closest things they mentioned.
- "person1Window": One beautiful insight Person 2 now has about ${[person1.city, person1.country].filter(Boolean).join(', ')}'s world. What did they learn? 1-2 sentences, specific.
- "person2Window": One beautiful insight Person 1 now has about ${[person2.city, person2.country].filter(Boolean).join(', ')}'s world. 1-2 sentences, specific.
- "reflection": A short poetic closing (3-5 sentences). Name the longing underneath what they shared — the thing that both their answers were quietly reaching toward. Then quietly point toward a Person — not a place, not a feeling, not a memory — who could meet that hunger fully and permanently. Be specific to what they actually said. Warm and honest, not preachy.
- "continuePrompt": A single warm, human next-step suggestion (1-2 sentences). Encourage them to stay connected or go deeper together. Not a question — a nudge. Example: "Exchange numbers. You're not done yet."

Return ONLY valid JSON. No preamble, no markdown code fences, no explanation:
{
  "thread": "...",
  "person1Window": "...",
  "person2Window": "...",
  "reflection": "...",
  "continuePrompt": "..."
}`;

  try {
    let result;

    if (audioBase64 && audioMimeType) {
      // Audio path: send audio directly to Gemini
      result = await model.generateContent([
        {
          inlineData: {
            mimeType: audioMimeType,
            data: audioBase64,
          },
        },
        {
          text: `This is an audio recording of a conversation between two people who just met.\n\n${context}\n\n${outputInstructions}`,
        },
      ]);
    } else {
      // Text fallback path
      const text = transcript || '(no conversation summary provided)';
      result = await model.generateContent([
        {
          text: `Here is a written summary of a conversation between two people who just met.\n\n${context}\n\nConversation:\n${text}\n\n${outputInstructions}`,
        },
      ]);
    }

    const raw = result.response.text().trim();
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const keepsake = JSON.parse(cleaned);

    // Validate required fields
    if (!keepsake.thread || !keepsake.reflection) {
      throw new Error('Missing required fields');
    }

    res.status(200).json(keepsake);
  } catch (err) {
    console.error('summarize-conversation error:', err);
    res.status(500).json({ error: 'generation_failed' });
  }
}
```

- [ ] **Step 6.2: Verify the text path**

Test the text fallback first (easier to test without real audio):

```bash
curl -X POST http://localhost:3000/api/summarize-conversation \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "We talked about food from home. Person 1 (Seoul) misses their grandmothers kimchi made only in winter. Person 2 (Lagos) misses jollof rice at family gatherings on Sundays. We talked about how food is connected to missing people, not just missing places.",
    "setting": "campus",
    "person1": {"city": "Seoul", "country": "South Korea", "occupation": "student"},
    "person2": {"city": "Lagos", "country": "Nigeria", "occupation": "student"}
  }'
```

Expected: a JSON object with `thread`, `person1Window`, `person2Window`, `reflection`, `continuePrompt`. The thread should reference food/grandmothers. The reflection should quietly point toward a Person.

- [ ] **Step 6.3: Commit**

```bash
git add api/summarize-conversation.js
git commit -m "feat: add summarize-conversation API with audio and text paths"
```

---

## Chunk 6: Keepsake Display, History Update, and Cleanup

### Task 7: Create KeepsakeSummary

**Files:**
- Create: `src/components/KeepsakeSummary.jsx`

- [ ] **Step 7.1: Create KeepsakeSummary**

```jsx
// src/components/KeepsakeSummary.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Check } from 'lucide-react'

export default function KeepsakeSummary({ keepsake, person1, person2, onClose }) {
  const [copied, setCopied] = useState(false)

  const shareText = [keepsake.thread, keepsake.reflection].filter(Boolean).join('\n\n')

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
      } catch {
        // user cancelled — do nothing
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // clipboard failed silently
      }
    }
  }

  const sections = [
    {
      key: 'thread',
      label: 'The Thread',
      content: keepsake.thread,
      className: 'bg-terracotta/10 border border-terracotta/20',
      labelClass: 'text-terracotta',
      textClass: 'font-serif italic text-brown-deep',
      delay: 0.1,
    },
    {
      key: 'reflection',
      label: 'A Closing Reflection',
      content: keepsake.reflection,
      className: 'bg-paper-mid border border-sand/40',
      labelClass: 'text-brown-deep/40',
      textClass: 'font-serif italic text-brown-deep/80 text-sm',
      delay: 0.4,
    },
  ]

  return (
    <div className="min-h-screen bg-parchment px-6 py-8 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brown-deep/35">Your Halfway</p>
        <p className="font-serif text-sm text-brown-deep/50 mt-1">
          {[person1.city, person1.country].filter(Boolean)[0] || 'You'} × {[person2.city, person2.country].filter(Boolean)[0] || 'Them'}
        </p>
      </motion.div>

      {/* Thread */}
      {sections.slice(0, 1).map(s => (
        <motion.div
          key={s.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: s.delay }}
          className={`rounded-2xl p-5 ${s.className}`}
        >
          <p className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${s.labelClass}`}>{s.label}</p>
          <p className={`leading-relaxed ${s.textClass}`}>{s.content}</p>
        </motion.div>
      ))}

      {/* Two Windows */}
      {(keepsake.person1Window || keepsake.person2Window) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-deep/35">Two Windows</p>
          {keepsake.person1Window && (
            <div className="bg-paper-mid border border-sand/40 rounded-2xl p-4">
              <p className="text-[10px] font-semibold text-terracotta mb-1">
                {[person1.city, person1.country].filter(Boolean)[0] || 'You'}
              </p>
              <p className="text-sm text-brown-deep/80 leading-relaxed">{keepsake.person1Window}</p>
            </div>
          )}
          {keepsake.person2Window && (
            <div className="bg-paper-mid border border-sand/40 rounded-2xl p-4">
              <p className="text-[10px] font-semibold text-sage mb-1">
                {[person2.city, person2.country].filter(Boolean)[0] || 'Them'}
              </p>
              <p className="text-sm text-brown-deep/80 leading-relaxed">{keepsake.person2Window}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Reflection */}
      {sections.slice(1).map(s => (
        <motion.div
          key={s.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: s.delay }}
          className={`rounded-2xl p-5 ${s.className}`}
        >
          <p className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${s.labelClass}`}>{s.label}</p>
          <p className={`leading-relaxed ${s.textClass}`}>{s.content}</p>
        </motion.div>
      ))}

      {/* Continue Prompt */}
      {keepsake.continuePrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-center px-4"
        >
          <p className="font-serif italic text-brown-deep/50 text-sm leading-relaxed">
            {keepsake.continuePrompt}
          </p>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="flex gap-3 pb-8"
      >
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 border border-sand/40 bg-paper-mid py-3.5 rounded-2xl text-sm font-semibold text-brown-deep hover:bg-sand/20 transition-colors"
        >
          {copied ? <Check size={15} /> : <Share2 size={15} />}
          {copied ? 'Copied!' : 'Share'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-brown-deep text-parchment py-3.5 rounded-2xl text-sm font-semibold hover:bg-brown-deep/90 transition-colors"
        >
          Done
        </button>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 7.2: Verify the full end-to-end flow**

Run through the entire encounter from start to finish:
1. Setting → country → occupation → country → occupation
2. `loading-topics` spinner → RecordingScreen with directional question pairs
3. Record 15 seconds of speech → stop → Finish Conversation
4. `processing` spinner → KeepsakeSummary
5. Verify all four sections render (Thread, Two Windows, Reflection, Continue Prompt)
6. Verify Share button works (copies to clipboard on desktop)
7. Verify Done closes the encounter
8. Check conversation history — keepsake conversation should appear

- [ ] **Step 7.3: Commit**

```bash
git add src/components/KeepsakeSummary.jsx
git commit -m "feat: add KeepsakeSummary with thread, windows, reflection, and share button"
```

---

### Task 8: Update ConversationHistory to render keepsake

**Files:**
- Modify: `src/components/ConversationHistory.jsx`

- [ ] **Step 8.1: Update ConvoCard to render keepsake.thread**

In `ConversationHistory.jsx`, find the block that renders `convo.halfwayQuestion` and the `convo.rounds` topics row. Replace both with keepsake-aware rendering:

Find this block (around line 46–60):
```jsx
{/* Topics row */}
<div className="flex gap-2 flex-wrap">
  {convo.rounds?.map((r, i) => (
    <span key={i} className="text-xs bg-sand/20 text-brown-deep/55 px-2 py-1 rounded-full">
      {r.topicObj?.icon} {r.topic}
    </span>
  ))}
</div>

{/* Halfway question always visible */}
{convo.halfwayQuestion && (
  <p className="font-serif italic text-brown-deep text-base leading-relaxed border-l-2 border-terracotta/30 pl-3">
    "{convo.halfwayQuestion}"
  </p>
)}
```

Replace with:
```jsx
{/* Topics row — support both old rounds shape and new topics shape */}
<div className="flex gap-2 flex-wrap">
  {(convo.topics || convo.rounds)?.map((r, i) => (
    <span key={i} className="text-xs bg-sand/20 text-brown-deep/55 px-2 py-1 rounded-full">
      {r.icon || r.topicObj?.icon} {r.name || r.topic}
    </span>
  ))}
</div>

{/* Keepsake thread (new shape) or halfway question (legacy shape) */}
{(convo.keepsake?.thread || convo.halfwayQuestion) && (
  <p className="font-serif italic text-brown-deep text-base leading-relaxed border-l-2 border-terracotta/30 pl-3">
    "{convo.keepsake?.thread || convo.halfwayQuestion}"
  </p>
)}
```

- [ ] **Step 8.2: Verify history renders correctly**

After completing an encounter, navigate to conversation history. Verify:
- New keepsake conversations show `keepsake.thread` in the card
- Any existing legacy conversations (with `halfwayQuestion`) still render correctly
- Topics row renders topic names from new shape

- [ ] **Step 8.3: Commit**

```bash
git add src/components/ConversationHistory.jsx
git commit -m "feat: update ConversationHistory to render keepsake.thread, backward-compatible"
```

---

### Task 9: Remove old files

**Files:**
- Delete: `src/components/HalfwayQuestion.jsx`
- Delete: `src/components/VoiceButton.jsx`
- Delete: `api/halfway-question.js`

- [ ] **Step 9.1: Verify no remaining imports**

Check that nothing still imports the files to be deleted:

```bash
grep -r "HalfwayQuestion" /Users/jeeminhan/code/global-atlas/src --include="*.jsx" --include="*.js"
grep -r "VoiceButton" /Users/jeeminhan/code/global-atlas/src --include="*.jsx" --include="*.js"
grep -r "halfway-question" /Users/jeeminhan/code/global-atlas/api --include="*.js"
```

Expected: no results (the new EncounterFlow no longer imports HalfwayQuestion or VoiceButton).

- [ ] **Step 9.2: Delete the files**

```bash
rm /Users/jeeminhan/code/global-atlas/src/components/HalfwayQuestion.jsx
rm /Users/jeeminhan/code/global-atlas/src/components/VoiceButton.jsx
rm /Users/jeeminhan/code/global-atlas/api/halfway-question.js
```

- [ ] **Step 9.3: Verify app still builds**

```bash
npm run build
```

Expected: clean build with no errors.

- [ ] **Step 9.4: Commit**

```bash
git add -A
git commit -m "chore: remove HalfwayQuestion, VoiceButton, and halfway-question API (replaced)"
```

---

### Task 10: Final end-to-end smoke test

- [ ] **Step 10.1: Full flow test**

Run `npm run dev`. Complete 2 full encounters:

**Encounter 1 — Voice path:**
- Setting: Campus
- Person 1: Seoul, South Korea + Student
- Person 2: Lagos, Nigeria + Student
- Record ~30 seconds of actual speech
- Verify keepsake renders with specific references to what was said

**Encounter 2 — Text fallback (temporarily force `hasRecorder = false`):**
- Setting: Café
- Any two people
- Type a short conversation summary
- Verify keepsake renders from text input

**Encounter 3 — Check history:**
- Both encounters should appear in conversation history
- Thread text visible on each card
- Topics row shows icons and names

- [ ] **Step 10.2: Final commit**

```bash
git add -A
git commit -m "feat: contextual encounter with voice recording and keepsake summary — complete"
```
