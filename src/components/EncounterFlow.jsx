import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { drawTopics } from '../data/topics'
import HalfwayQuestion from './HalfwayQuestion'
import CountryPicker from './CountryPicker'

const TOPICS_PER_GAME = 3
const FALLBACK_QUESTION = "What would it mean to find a kind of belonging that couldn't be taken away when you move?"

export default function EncounterFlow({ onSave, onClose }) {
  const [step, setStep] = useState('who-you') // 'who-you' | 'who-them' | 'round' | 'generating' | 'halfway'
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

          {step === 'who-you' && (
            <motion.div key="who-you" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-64px)] flex flex-col -mx-6">
              <CountryPicker
                label="You"
                accentColor="terracotta"
                onConfirm={(data) => {
                  setPerson1(p => ({ ...p, country: data.country, city: data.city }))
                  setStep('who-them')
                }}
              />
            </motion.div>
          )}

          {step === 'who-them' && (
            <motion.div key="who-them" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-[calc(100vh-64px)] flex flex-col -mx-6">
              <CountryPicker
                label="Them"
                accentColor="sage"
                onConfirm={(data) => {
                  setPerson2(p => ({ ...p, country: data.country, city: data.city }))
                  setStep('round')
                }}
              />
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
