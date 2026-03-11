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
