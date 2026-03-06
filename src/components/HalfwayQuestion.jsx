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
