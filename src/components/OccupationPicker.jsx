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
