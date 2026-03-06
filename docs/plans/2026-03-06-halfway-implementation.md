# Halfway Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild Global Atlas as "Halfway" — a philosophical two-way conversation tool where both people answer 3 questions drawn from 6 philosophical topics, and Gemini generates one Halfway Question from all six answers.

**Architecture:** Full React SPA with screen-based state in App.jsx (no router). Six philosophical topics in a static data file. Gemini API generates the Halfway Question. Conversations stored in localStorage. Existing WorldMap component reused for Atlas view.

**Tech Stack:** React 18, Vite, Tailwind CSS, Framer Motion, @google/generative-ai, Playfair Display + Inter (Google Fonts), Vercel serverless functions

---

### Task 1: Foundation — fonts, palette, global CSS

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`
- Modify: `tailwind.config.js`

**Step 1: Add Google Fonts to index.html**

Inside `<head>`, add:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Also update `<title>` to `Halfway`.

**Step 2: Replace src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --parchment: #F5EFE0;
  --brown-deep: #2C1810;
  --terracotta: #C4622D;
  --sage: #7A9E7E;
  --sand: #D4A96A;
  --paper-mid: #EDE5D0;
}

body {
  background-color: var(--parchment);
  color: var(--brown-deep);
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
}

/* 3D card flip utilities */
.perspective-1000 { perspective: 1000px; }
.backface-hidden { backface-visibility: hidden; }
```

**Step 3: Update tailwind.config.js**

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#F5EFE0',
        'brown-deep': '#2C1810',
        terracotta: '#C4622D',
        sage: '#7A9E7E',
        sand: '#D4A96A',
        'paper-mid': '#EDE5D0',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

**Step 4: Verify**
Run: `npm run dev`
Expected: background is warm parchment `#F5EFE0`, not white. Browser tab says "Halfway".

**Step 5: Commit**
```bash
git add index.html src/index.css tailwind.config.js
git commit -m "feat: Halfway foundation — parchment palette, Playfair Display + Inter fonts"
```

---

### Task 2: Philosophical topics data

**Files:**
- Create: `src/data/topics.js`

**Step 1: Create src/data/topics.js**

```js
export const topics = [
  {
    id: 'loss',
    icon: '🍂',
    name: 'Loss',
    question: 'What have you left behind that still travels with you?',
    color: '#C4622D',
  },
  {
    id: 'belonging',
    icon: '🌊',
    name: 'Belonging',
    question: 'Where do you feel most like yourself?',
    color: '#5B8FA8',
  },
  {
    id: 'beauty',
    icon: '✨',
    name: 'Beauty',
    question: 'What stops you in your tracks?',
    color: '#D4A96A',
  },
  {
    id: 'enough',
    icon: '🕊️',
    name: 'Enough',
    question: 'What would make your life feel complete?',
    color: '#7A9E7E',
  },
  {
    id: 'home',
    icon: '🏡',
    name: 'Home',
    question: 'Where is home, really?',
    color: '#9B7653',
  },
  {
    id: 'unknown',
    icon: '🌙',
    name: 'The Unknown',
    question: 'What are you still searching for?',
    color: '#6B5B8A',
  },
];

export function drawTopics(count = 3) {
  const shuffled = [...topics].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
```

**Step 2: Commit**
```bash
git add src/data/topics.js
git commit -m "feat: 6 philosophical topics for Halfway"
```

---

### Task 3: Gemini API — Halfway Question

**Files:**
- Create: `api/halfway-question.js`
- Modify: `vite.config.js`

**Step 1: Create api/halfway-question.js**

```js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    person1City, person1Country, person1Answers,
    person2City, person2Country, person2Answers,
  } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are generating one philosophical question for two people who just had a conversation together.

Person 1 is from ${person1City}${person1Country ? ', ' + person1Country : ''}.
Person 2 is from ${person2City}${person2Country ? ', ' + person2Country : ''}.

Their answers to three philosophical questions:

${person1Answers.map((a, i) => `Person 1 on "${a.topic}": "${a.answer}"`).join('\n')}

${person2Answers.map((a, i) => `Person 2 on "${a.topic}": "${a.answer}"`).join('\n')}

Generate ONE question — the "Halfway Question" — that:
- Finds the thread that runs through BOTH people's answers
- Names something neither person said explicitly but both circled around
- Lives in the shared space between their two stories
- Feels like genuine philosophical curiosity aimed at both of them equally
- Moves toward meaning, belonging, transcendence, or what lasts
- Does not mention religion, God, or faith directly
- Is warm, specific, and impossible to answer with a yes or no
- Reads beautifully in italic serif — it should feel like a line from a novel

Return only the question. No preamble, no explanation.
`;

  try {
    const result = await model.generateContent([{ text: prompt }]);
    const question = result.response.text().trim();
    res.status(200).json({ question });
  } catch (err) {
    res.status(500).json({ error: "generation_failed" });
  }
}
```

**Step 2: Add dev middleware to vite.config.js**

Inside `configureServer(server)`, after any existing middleware, add:

```js
server.middlewares.use('/api/halfway-question', async (req, res) => {
  if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
  let body = ''
  req.on('data', chunk => { body += chunk })
  req.on('end', async () => {
    try {
      const {
        person1City, person1Country, person1Answers,
        person2City, person2Country, person2Answers,
      } = JSON.parse(body)
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) throw new Error('No GEMINI_API_KEY in .env.local')

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const prompt = `
You are generating one philosophical question for two people who just had a conversation together.

Person 1 is from ${person1City}${person1Country ? ', ' + person1Country : ''}.
Person 2 is from ${person2City}${person2Country ? ', ' + person2Country : ''}.

Their answers to three philosophical questions:

${person1Answers.map(a => `Person 1 on "${a.topic}": "${a.answer}"`).join('\n')}

${person2Answers.map(a => `Person 2 on "${a.topic}": "${a.answer}"`).join('\n')}

Generate ONE question — the "Halfway Question" — that:
- Finds the thread that runs through BOTH people's answers
- Names something neither person said explicitly but both circled around
- Lives in the shared space between their two stories
- Feels like genuine philosophical curiosity aimed at both of them equally
- Moves toward meaning, belonging, transcendence, or what lasts
- Does not mention religion, God, or faith directly
- Is warm, specific, and impossible to answer with a yes or no
- Reads beautifully in italic serif — it should feel like a line from a novel

Return only the question. No preamble, no explanation.
`
      const result = await model.generateContent([{ text: prompt }])
      const question = result.response.text().trim()
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ question }))
    } catch (err) {
      console.error('[Halfway dev error]', err.message)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'generation_failed', detail: err.message }))
    }
  })
})
```

**Step 3: Commit**
```bash
git add api/halfway-question.js vite.config.js
git commit -m "feat: Halfway Question API — Gemini synthesizes both people's answers into one question"
```

---

### Task 4: App.jsx — new shell

**Files:**
- Rewrite: `src/App.jsx`

**Step 1: Completely replace src/App.jsx**

```jsx
import React, { useState } from 'react'
import DemoLoop from './components/DemoLoop'
import EncounterFlow from './components/EncounterFlow'
import ConversationHistory from './components/ConversationHistory'
import AtlasView from './components/AtlasView'

const STORAGE_KEY = 'halfway-conversations'

function loadConversations() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}

function saveConversations(convos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos))
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [conversations, setConversations] = useState(loadConversations)

  const handleSave = (convo) => {
    const updated = [convo, ...conversations]
    setConversations(updated)
    saveConversations(updated)
    setScreen('home')
  }

  return (
    <div className="min-h-screen bg-parchment">
      {screen === 'home' && (
        <DemoLoop
          hasHistory={conversations.length > 0}
          onStart={() => setScreen('encounter')}
          onHistory={() => setScreen('history')}
          onAtlas={() => setScreen('atlas')}
        />
      )}
      {screen === 'encounter' && (
        <EncounterFlow
          onSave={handleSave}
          onClose={() => setScreen('home')}
        />
      )}
      {screen === 'history' && (
        <ConversationHistory
          conversations={conversations}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'atlas' && (
        <AtlasView
          conversations={conversations}
          onBack={() => setScreen('home')}
        />
      )}
    </div>
  )
}
```

**Step 2: Commit**
```bash
git add src/App.jsx
git commit -m "feat: Halfway App shell — screen-based navigation, localStorage persistence"
```

---

### Task 5: DemoLoop.jsx — animated opening

**Files:**
- Create: `src/components/DemoLoop.jsx`

**Step 1: Create src/components/DemoLoop.jsx**

```jsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DEMO_STEPS = [
  { type: 'cities', content: 'Seoul · Toronto' },
  { type: 'topic', icon: '🍂', name: 'Loss', question: 'What have you left behind that still travels with you?' },
  { type: 'answer1', text: '"Hotpot with my mom — I haven\'t found anything like it here"' },
  { type: 'answer2', text: '"The feeling of walking into my home church on a Sunday morning"' },
  { type: 'halfway', text: 'You both described belonging as something tied to a specific person or place. What would it mean to find something like that which couldn\'t be taken away?' },
]

const STEP_DURATIONS = [1800, 2400, 2800, 2800, 4500]

export default function DemoLoop({ hasHistory, onStart, onHistory, onAtlas }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const duration = STEP_DURATIONS[step] ?? 2000
    const timer = setTimeout(() => {
      const next = (step + 1) % DEMO_STEPS.length
      setStep(next)
    }, duration)
    return () => clearTimeout(timer)
  }, [step])

  const current = DEMO_STEPS[step]

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-16 max-w-md mx-auto">
      {/* Demo area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-center w-full"
          >
            {current.type === 'cities' && (
              <p className="font-serif text-2xl text-brown-deep/40 tracking-wide">
                {current.content}
              </p>
            )}

            {current.type === 'topic' && (
              <div className="bg-paper-mid rounded-2xl p-6 shadow-sm border border-sand/30">
                <p className="text-4xl mb-3">{current.icon}</p>
                <p className="font-serif text-xl font-bold text-brown-deep mb-2">{current.name}</p>
                <p className="font-serif italic text-brown-deep/60 text-base leading-relaxed">
                  {current.question}
                </p>
              </div>
            )}

            {current.type === 'answer1' && (
              <div className="rounded-xl p-4 bg-terracotta/8 border border-terracotta/20">
                <p className="font-serif italic text-brown-deep/70 text-base leading-relaxed">
                  {current.text}
                </p>
              </div>
            )}

            {current.type === 'answer2' && (
              <div className="rounded-xl p-4 bg-sage/10 border border-sage/20">
                <p className="font-serif italic text-brown-deep/70 text-base leading-relaxed">
                  {current.text}
                </p>
              </div>
            )}

            {current.type === 'halfway' && (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-sand">
                  Halfway Question
                </p>
                <p className="font-serif italic text-brown-deep text-xl leading-relaxed">
                  "{current.text}"
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Brand + CTA */}
      <div className="w-full space-y-6 text-center">
        <div>
          <h1 className="font-serif text-5xl font-bold text-brown-deep">Halfway</h1>
          <p className="text-brown-deep/40 mt-2 text-sm italic font-serif">
            Where are you really from?
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onStart}
            className="w-full bg-brown-deep text-parchment py-4 rounded-2xl font-semibold text-base hover:bg-brown-deep/90 transition-colors"
          >
            Start a Conversation
          </button>

          {hasHistory && (
            <button
              onClick={onHistory}
              className="w-full text-brown-deep/50 py-2 text-sm hover:text-brown-deep transition-colors font-serif italic"
            >
              Past Conversations
            </button>
          )}
        </div>

        <button
          onClick={onAtlas}
          className="text-brown-deep/25 text-xs hover:text-brown-deep/50 transition-colors"
        >
          🌍 Atlas
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Verify**
Open `http://localhost:5173`. The demo cycles through: cities → topic card → two answers (terracotta and sage tinted) → Halfway Question → repeats. "Halfway" title in large serif at bottom. "Start a Conversation" button.

**Step 3: Commit**
```bash
git add src/components/DemoLoop.jsx
git commit -m "feat: DemoLoop — cycling animated opening sequence"
```

---

### Task 6: EncounterFlow.jsx — the full game

**Files:**
- Create: `src/components/EncounterFlow.jsx`

**Step 1: Create src/components/EncounterFlow.jsx**

```jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { drawTopics } from '../data/topics'
import HalfwayQuestion from './HalfwayQuestion'

const TOPICS_PER_GAME = 3
const FALLBACK_QUESTION = "What would it mean to find a kind of belonging that couldn't be taken away when you move?"

export default function EncounterFlow({ onSave, onClose }) {
  const [step, setStep] = useState('who') // 'who' | 'round' | 'generating' | 'halfway'
  const [person1, setPerson1] = useState({ city: '', country: '', name: '' })
  const [person2, setPerson2] = useState({ city: '', country: '', name: '' })
  const [topics] = useState(() => drawTopics(TOPICS_PER_GAME))
  const [roundIndex, setRoundIndex] = useState(0)
  const [rounds, setRounds] = useState([])
  const [answer1, setAnswer1] = useState('')
  const [answer2, setAnswer2] = useState('')
  const [halfwayQuestion, setHalfwayQuestion] = useState(null)

  const currentTopic = topics[roundIndex]
  const isLastRound = roundIndex === TOPICS_PER_GAME - 1

  const handleRoundSubmit = () => {
    if (!answer1.trim() || !answer2.trim()) return
    const newRounds = [...rounds, {
      topic: currentTopic.name,
      topicObj: currentTopic,
      answer1: answer1.trim(),
      answer2: answer2.trim(),
    }]
    setRounds(newRounds)
    setAnswer1('')
    setAnswer2('')
    if (isLastRound) {
      generateHalfwayQuestion(newRounds)
    } else {
      setRoundIndex(i => i + 1)
    }
  }

  const generateHalfwayQuestion = async (finalRounds) => {
    setStep('generating')
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch('/api/halfway-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          person1City: person1.city,
          person1Country: person1.country,
          person1Answers: finalRounds.map(r => ({ topic: r.topic, answer: r.answer1 })),
          person2City: person2.city,
          person2Country: person2.country,
          person2Answers: finalRounds.map(r => ({ topic: r.topic, answer: r.answer2 })),
        })
      })
      clearTimeout(timeout)
      const data = await res.json()
      setHalfwayQuestion(data.question || FALLBACK_QUESTION)
    } catch {
      setHalfwayQuestion(FALLBACK_QUESTION)
    }
    setStep('halfway')
  }

  const handleSave = () => {
    onSave({
      id: `convo-${Date.now()}`,
      person1,
      person2,
      rounds,
      halfwayQuestion,
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <div className="flex justify-between items-center px-6 py-4 shrink-0">
        <h1 className="font-serif text-lg font-bold text-brown-deep">Halfway</h1>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-paper-mid transition-colors">
          <X size={18} className="text-brown-deep/50" />
        </button>
      </div>

      <div className="flex-1 px-6 pb-10 max-w-md mx-auto w-full overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* Who's here */}
          {step === 'who' && (
            <motion.div
              key="who"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6 pt-2"
            >
              <div>
                <h2 className="font-serif text-2xl font-bold text-brown-deep">Who's here?</h2>
                <p className="text-brown-deep/40 text-sm mt-1">Two people. Two places.</p>
              </div>

              {[
                { person: person1, setPerson: setPerson1, label: 'You', accent: 'terracotta' },
                { person: person2, setPerson: setPerson2, label: 'Them', accent: 'sage' },
              ].map(({ person, setPerson, label, accent }) => (
                <div key={label} className="bg-paper-mid rounded-2xl p-5 border border-sand/30 space-y-4">
                  <p className={`text-xs font-semibold uppercase tracking-widest text-${accent}`}>{label}</p>
                  {[
                    { key: 'name', placeholder: 'Name (optional)' },
                    { key: 'city', placeholder: 'City *' },
                    { key: 'country', placeholder: 'Country' },
                  ].map(({ key, placeholder }) => (
                    <input
                      key={key}
                      value={person[key]}
                      onChange={e => setPerson(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className={`w-full bg-transparent border-b border-sand/40 pb-2 text-brown-deep placeholder:text-brown-deep/25 focus:outline-none focus:border-${accent} text-sm transition-colors`}
                    />
                  ))}
                </div>
              ))}

              <button
                disabled={!person1.city.trim() || !person2.city.trim()}
                onClick={() => setStep('round')}
                className="w-full bg-brown-deep text-parchment py-4 rounded-2xl font-semibold disabled:opacity-30 hover:bg-brown-deep/90 transition-colors"
              >
                Begin →
              </button>
            </motion.div>
          )}

          {/* Round */}
          {step === 'round' && (
            <motion.div
              key={`round-${roundIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5 pt-2"
            >
              {/* Progress */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-brown-deep/35 uppercase tracking-widest font-semibold">
                  Question {roundIndex + 1} of {TOPICS_PER_GAME}
                </p>
                <div className="flex gap-1.5">
                  {topics.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 w-8 rounded-full transition-colors ${i <= roundIndex ? 'bg-terracotta' : 'bg-sand/30'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div
                className="rounded-2xl p-6 border text-center"
                style={{ backgroundColor: currentTopic.color + '12', borderColor: currentTopic.color + '30' }}
              >
                <p className="text-4xl mb-2">{currentTopic.icon}</p>
                <p className="font-serif text-xl font-bold text-brown-deep mb-1">{currentTopic.name}</p>
                <p className="font-serif italic text-brown-deep/60 text-base leading-relaxed">
                  "{currentTopic.question}"
                </p>
              </div>

              {/* Answer 1 */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
                  {person1.name || 'You'}
                </p>
                <textarea
                  value={answer1}
                  onChange={e => setAnswer1(e.target.value)}
                  placeholder="Their answer..."
                  rows={3}
                  className="w-full bg-paper-mid border border-sand/40 rounded-xl p-3 text-brown-deep placeholder:text-brown-deep/25 focus:outline-none focus:border-terracotta resize-none text-sm"
                />
              </div>

              {/* Answer 2 */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-sage">
                  {person2.name || 'Them'}
                </p>
                <textarea
                  value={answer2}
                  onChange={e => setAnswer2(e.target.value)}
                  placeholder="Their answer..."
                  rows={3}
                  className="w-full bg-paper-mid border border-sand/40 rounded-xl p-3 text-brown-deep placeholder:text-brown-deep/25 focus:outline-none focus:border-sage resize-none text-sm"
                />
              </div>

              <button
                disabled={!answer1.trim() || !answer2.trim()}
                onClick={handleRoundSubmit}
                className="w-full bg-brown-deep text-parchment py-4 rounded-2xl font-semibold disabled:opacity-30 hover:bg-brown-deep/90 transition-colors"
              >
                {isLastRound ? 'Find the Halfway →' : 'Next Question →'}
              </button>
            </motion.div>
          )}

          {/* Generating */}
          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[70vh] space-y-5"
            >
              <div className="w-7 h-7 rounded-full border-2 border-terracotta border-t-transparent animate-spin" />
              <p className="font-serif italic text-brown-deep/40 text-center text-sm">
                Finding the halfway point...
              </p>
            </motion.div>
          )}

          {/* Halfway Question */}
          {step === 'halfway' && halfwayQuestion && (
            <HalfwayQuestion
              key="halfway"
              question={halfwayQuestion}
              person1={person1}
              person2={person2}
              onSave={handleSave}
            />
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
```

**Step 2: Verify**
- Click "Start a Conversation" → Who's Here screen with You / Them cards
- Fill cities, click Begin
- Topic card shows with 3 round progress dots
- Fill both answers, click Next
- After round 3: spinner → Halfway Question
- Click "Save" → returns to home

**Step 3: Commit**
```bash
git add src/components/EncounterFlow.jsx
git commit -m "feat: EncounterFlow — full Halfway game flow"
```

---

### Task 7: HalfwayQuestion.jsx — the reveal

**Files:**
- Create: `src/components/HalfwayQuestion.jsx`

**Step 1: Create src/components/HalfwayQuestion.jsx**

```jsx
import React from 'react'
import { motion } from 'framer-motion'

export default function HalfwayQuestion({ question, person1, person2, onSave }) {
  const cities = [person1?.city, person2?.city].filter(Boolean).join(' · ')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center min-h-[80vh] space-y-12 pt-4 text-center"
    >
      {cities && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-serif text-brown-deep/30 text-sm tracking-wide"
        >
          {cities}
        </motion.p>
      )}

      <div className="space-y-5 max-w-xs">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs font-semibold uppercase tracking-widest text-sand"
        >
          Halfway Question
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9 }}
          className="font-serif italic text-2xl text-brown-deep leading-relaxed"
        >
          "{question}"
        </motion.p>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        onClick={onSave}
        className="text-brown-deep/35 text-sm hover:text-brown-deep/70 transition-colors font-serif italic"
      >
        Save this conversation →
      </motion.button>
    </motion.div>
  )
}
```

**Step 2: Commit**
```bash
git add src/components/HalfwayQuestion.jsx
git commit -m "feat: HalfwayQuestion — slow reveal with staggered fade-in"
```

---

### Task 8: ConversationHistory.jsx

**Files:**
- Create: `src/components/ConversationHistory.jsx`

**Step 1: Create src/components/ConversationHistory.jsx**

```jsx
import React from 'react'
import { ArrowLeft } from 'lucide-react'

export default function ConversationHistory({ conversations, onBack }) {
  return (
    <div className="min-h-screen bg-parchment">
      <div className="px-6 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-paper-mid transition-colors">
          <ArrowLeft size={18} className="text-brown-deep/50" />
        </button>
        <h1 className="font-serif text-xl font-bold text-brown-deep">Past Conversations</h1>
      </div>

      <div className="px-6 pb-10 space-y-4 max-w-md mx-auto">
        {conversations.length === 0 ? (
          <p className="font-serif italic text-brown-deep/30 text-center mt-20 text-lg">
            No conversations yet.
          </p>
        ) : (
          conversations.map(convo => (
            <div key={convo.id} className="bg-paper-mid rounded-2xl p-5 border border-sand/30 space-y-3">
              <p className="font-serif text-brown-deep/40 text-sm tracking-wide">
                {[convo.person1?.city, convo.person2?.city].filter(Boolean).join(' · ')}
              </p>

              <div className="flex gap-2 flex-wrap">
                {convo.rounds?.map((r, i) => (
                  <span key={i} className="text-xs bg-sand/20 text-brown-deep/55 px-2 py-1 rounded-full">
                    {r.topicObj?.icon} {r.topic}
                  </span>
                ))}
              </div>

              {convo.halfwayQuestion && (
                <p className="font-serif italic text-brown-deep text-base leading-relaxed border-l-2 border-terracotta/30 pl-3">
                  "{convo.halfwayQuestion}"
                </p>
              )}

              <p className="text-xs text-brown-deep/25">
                {new Date(convo.createdAt).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**
```bash
git add src/components/ConversationHistory.jsx
git commit -m "feat: ConversationHistory — past conversations list"
```

---

### Task 9: AtlasView.jsx

**Files:**
- Create: `src/components/AtlasView.jsx`

**Step 1: Create src/components/AtlasView.jsx**

The existing WorldMap component expects `countryStats` and `allCountryStats` objects keyed by country name with `{ count, people }` shape.

```jsx
import React, { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import WorldMap from './WorldMap'

export default function AtlasView({ conversations, onBack }) {
  const countryStats = useMemo(() => {
    const stats = {}
    conversations.forEach(convo => {
      const country = convo.person2?.country
      if (!country) return
      if (!stats[country]) stats[country] = { count: 0, people: [] }
      stats[country].count += 1
      stats[country].people.push({ name: convo.person2?.name || 'Someone' })
    })
    return stats
  }, [conversations])

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <div className="px-6 py-4 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-paper-mid transition-colors">
          <ArrowLeft size={18} className="text-brown-deep/50" />
        </button>
        <h1 className="font-serif text-xl font-bold text-brown-deep">Atlas</h1>
      </div>
      <div className="flex-1">
        <WorldMap
          countryStats={countryStats}
          allCountryStats={countryStats}
          onCountryClick={() => {}}
        />
      </div>
    </div>
  )
}
```

**Step 2: Commit**
```bash
git add src/components/AtlasView.jsx
git commit -m "feat: AtlasView — secondary world map using existing WorldMap component"
```

---

### Task 10: Final cleanup + full verification

**Files to delete** (no longer used):
- `src/components/JournalModal.jsx`
- `src/components/SouvenirDie.jsx`
- `src/components/RulesModal.jsx`
- `src/components/PassportGallery.jsx`
- `src/data/souvenirData.js`
- `src/data/demoData.js`

**Files to keep:**
- `src/components/WorldMap.jsx` — reused by AtlasView
- `src/components/FeedbackModal.jsx` — keep for now
- `src/components/VideoModal.jsx` — keep for now
- `src/utils/imageUtils.js` — keep (may add photo later)

**Step 1: Delete old files**
```bash
git rm src/components/JournalModal.jsx src/components/SouvenirDie.jsx src/components/RulesModal.jsx src/components/PassportGallery.jsx
git rm src/data/souvenirData.js src/data/demoData.js
```

**Step 2: Run build**
```bash
npm run build
```
Expected: clean build with no import errors. Fix any that surface.

**Step 3: Full flow verification in browser**
Go through each screen:
1. Home: demo loop cycles correctly, "Halfway" title visible
2. Start → Who's Here: fill two cities, Begin
3. Round 1: topic card shows, fill both answers, Next
4. Round 2 and 3: same
5. After round 3: spinner → Halfway Question fades in slowly
6. Save → back to home, "Past Conversations" link appears
7. Past Conversations: card shows cities, topics, Halfway Question
8. Atlas: world map shows, country lit up if conversations saved

**Step 4: Final commit**
```bash
git add -A
git commit -m "feat: Halfway v1 complete — full philosophical rebuild"
```
