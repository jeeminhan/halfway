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

// Generate contextual demo questions client-side when API is unavailable
function generateDemoQuestions(p1, p2, setting, drawnTopics) {
  const p1Place = p1.city || p1.country || 'your city'
  const p2Place = p2.city || p2.country || 'their city'
  const p1Occ = p1.occupation || 'person'
  const p2Occ = p2.occupation || 'person'
  const settingLabel = setting || 'this place'

  const templates = {
    loss: {
      question1: `As a ${p1Occ} from ${p1Place}, what's something you left behind when you came here — not a thing, but a feeling or a rhythm — that still follows you around ${settingLabel}?`,
      question2: `Growing up in ${p2Place} as a ${p2Occ}, what's a sound or smell from home that you'd give anything to walk into right now?`,
    },
    belonging: {
      question1: `In ${p1Place}, where did you feel most like yourself? Is there anywhere in ${settingLabel} that comes close?`,
      question2: `As a ${p2Occ} far from ${p2Place}, when was the last time you felt completely at home — not performing, not translating yourself — just existing?`,
    },
    beauty: {
      question1: `What's something beautiful in ${p1Place} that most people walk past without noticing — something only someone who grew up there as a ${p1Occ} would see?`,
      question2: `In ${p2Place}, what stops you in your tracks? Is there a moment or a season that makes everything else go quiet?`,
    },
    enough: {
      question1: `As a ${p1Occ} from ${p1Place}, what would make your life feel complete — not successful, but complete?`,
      question2: `If you could stop translating yourself between ${p2Place} and here, between being a ${p2Occ} and being yourself — what would that feel like?`,
    },
    home: {
      question1: `When someone in ${settingLabel} asks "where are you from?" — do you say ${p1Place}, or has the answer gotten more complicated than that?`,
      question2: `Is ${p2Place} still home, or is home something you're still looking for? What would home need to have for you to stop searching?`,
    },
    unknown: {
      question1: `As a ${p1Occ} who left ${p1Place}, what are you still searching for that no city, no degree, no achievement has been able to give you?`,
      question2: `What would it mean to be fully known — not just your ${p2Occ} self here, but the ${p2Place} version of you too — by someone who isn't going anywhere?`,
    },
  }

  return drawnTopics.map(t => {
    const tmpl = templates[t.id] || {
      question1: `What's something about life in ${p1Place} as a ${p1Occ} that you wish people here understood?`,
      question2: `What's something about ${p2Place} that you carry with you everywhere — something a ${p2Occ} from there just never loses?`,
    }
    return { ...t, question1: tmpl.question1, question2: tmpl.question2 }
  })
}

// Generate contextual demo keepsake when API is unavailable
function generateDemoKeepsake(p1, p2, setting) {
  const p1Place = p1.city || p1.country || 'your city'
  const p2Place = p2.city || p2.country || 'their city'
  return {
    thread: `Both of you — one from ${p1Place}, one from ${p2Place} — are carrying the same quiet hunger: to be fully known, in a place that feels like home, by someone who isn't going anywhere.`,
    person1Window: `${p2Place} isn't just a place on a map — it's Sunday cooking, it's the sound of a language that holds things English can't, it's a version of home that travels with a person even when they leave.`,
    person2Window: `${p1Place} shaped something deeper than culture — it gave them a way of seeing beauty in small moments, a longing for permanence that no amount of achievement here has been able to fill.`,
    reflection: `You met in ${setting || 'a place'} you'll both eventually leave. But what you shared — that hunger to be known completely, to belong somewhere permanent — that's not going anywhere. What if there's a Person who already knows both versions of you, the ${p1Place} one and the one sitting here, and isn't planning on leaving?`,
    continuePrompt: `Exchange numbers. This conversation isn't done yet.`,
  }
}

export default function EncounterFlow({ initialPerson1, initialPerson2, onSave, onClose }) {
  const [step, setStep] = useState('setting')
  const [setting, setSetting] = useState(null)
  const [person1, setPerson1] = useState(initialPerson1 || { city: '', country: '', occupation: '' })
  const [person2, setPerson2] = useState(initialPerson2 || { city: '', country: '', occupation: '' })
  const [topics] = useState(() => drawTopics(3))
  const [enrichedTopics, setEnrichedTopics] = useState(null)
  const [keepsake, setKeepsake] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)

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
      } else {
        throw new Error('Insufficient questions')
      }
    } catch {
      // API unavailable — use client-side contextual demo questions
      const demoTopics = generateDemoQuestions(p1, p2, s, drawnTopics)
      setEnrichedTopics(demoTopics)
    }
    setStep('recording')
  }

  const handleRecordingFinish = async (recordingData) => {
    if (recordingData.discard) {
      setEnrichedTopics(null)
      setStep('who-them-occupation')
      return
    }

    // Save audio locally if available
    if (recordingData.audioBlob) {
      const url = URL.createObjectURL(recordingData.audioBlob)
      setAudioUrl(url)
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
          audioBase64: recordingData.audioBase64,
          audioMimeType: recordingData.audioMimeType,
          transcript: recordingData.transcript,
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
        // API unavailable — use contextual demo keepsake
        save(generateDemoKeepsake(person1, person2, setting))
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
              audioUrl={audioUrl}
              onClose={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
