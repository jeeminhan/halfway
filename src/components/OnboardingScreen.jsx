import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDES = [
  {
    icon: '🌍',
    heading: 'Where are you really from?',
    body: 'Not the passport answer. The real one — the place that shaped how you see everything.',
  },
  {
    icon: '💬',
    heading: 'Both of you answer three questions.',
    body: 'About what you\'ve lost. Where you belong. What you\'re still searching for. The same questions. Different answers.',
    topics: ['🍂 Loss', '🌊 Belonging', '🌙 The Unknown'],
  },
  {
    icon: '✦',
    heading: 'AI finds what\'s between you.',
    body: 'It reads all six answers and generates one question — the thing you both circled without either of you saying it. That\'s the halfway point.',
  },
]

export default function OnboardingScreen({ onDone }) {
  const [slide, setSlide] = useState(0)
  const isLast = slide === SLIDES.length - 1

  const handleNext = () => {
    if (isLast) {
      onDone()
    } else {
      setSlide(s => s + 1)
    }
  }

  const current = SLIDES[slide]

  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-between px-6 py-16 max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center w-full space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-5 w-full"
          >
            <div className="ink-card wash-sand p-8 text-center space-y-5 w-full border border-sand/30">
              <p className="text-6xl">{current.icon}</p>
              <h2 className="font-serif text-2xl font-bold text-brown-deep leading-tight">
                {current.heading}
              </h2>
              <p className="text-brown-deep/60 text-base leading-relaxed max-w-xs mx-auto">
                {current.body}
              </p>
              {current.topics && (
                <div className="flex gap-2 justify-center flex-wrap pt-2">
                  {current.topics.map(t => (
                    <span key={t} className="text-sm bg-paper-mid border border-sand/40 text-brown-deep/70 px-3 py-1.5 rounded-full font-serif italic">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full space-y-6">
        <div className="flex gap-2 justify-center">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slide ? 'w-6 bg-terracotta' : 'w-2 bg-sand/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-brown-deep text-parchment py-4 rounded-2xl font-semibold text-base hover:bg-brown-deep/90 transition-colors"
        >
          {isLast ? 'Start a Conversation' : 'Continue →'}
        </button>

        {!isLast && (
          <button
            onClick={onDone}
            className="w-full text-brown-deep/30 text-sm hover:text-brown-deep/50 transition-colors"
          >
            Skip intro
          </button>
        )}
      </div>
    </div>
  )
}
