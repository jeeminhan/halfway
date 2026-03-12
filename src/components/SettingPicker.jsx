// src/components/SettingPicker.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SettingPicker({ onConfirm }) {
  const [setting, setSetting] = useState('a quiet corner of a campus café')
  const canContinue = setting.trim().length > 2

  const handleSubmit = () => {
    if (canContinue) onConfirm(setting.trim())
  }

  return (
    <div className="h-screen bg-parchment flex flex-col px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-serif text-3xl font-bold text-brown-deep mb-1">Where are you right now?</h1>
        <p className="text-brown-deep/50 text-sm italic">
          Be as specific as possible. "Third-floor campus cafe by the windows" is better than "campus."
        </p>
      </motion.div>

      <div className="flex-1 space-y-4">
        <input
          type="text"
          value={setting}
          onChange={(e) => setSetting(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
          placeholder="e.g. quiet corner table at Medici, outside the student center after the event"
          className="w-full bg-paper-mid border border-sand/40 rounded-2xl px-4 py-4 text-brown-deep placeholder:text-brown-deep/30 focus:outline-none focus:border-terracotta text-sm leading-relaxed"
          autoFocus
        />
        <p className="text-xs text-brown-deep/38 leading-relaxed">
          The more specific this is, the better the AI can shape the opening questions.
        </p>
      </div>

      <AnimatePresence>
        {canContinue && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => onConfirm(setting.trim())}
            className="mt-6 w-full bg-brown-deep text-parchment py-4 rounded-2xl font-semibold hover:bg-brown-deep/90 transition-colors"
          >
            Continue →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
