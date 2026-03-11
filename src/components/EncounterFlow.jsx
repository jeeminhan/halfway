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
