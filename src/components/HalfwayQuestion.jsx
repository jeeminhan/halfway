import React from 'react'
import { motion } from 'framer-motion'

export default function HalfwayQuestion({ question, person1, person2, onSave }) {
  const cities = [person1?.city || person1?.country, person2?.city || person2?.country]
    .filter(Boolean).join(' · ')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="relative flex flex-col items-center justify-center min-h-[85vh] text-center px-2"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 45%, rgba(196, 98, 45, 0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative space-y-10 max-w-xs">
        {cities && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-serif text-brown-deep/30 text-sm tracking-widest uppercase"
          >
            {cities}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sand">
            ✦ Halfway Question
          </p>
          <p className="font-serif italic text-[1.55rem] text-brown-deep leading-snug">
            "{question}"
          </p>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="w-12 h-px bg-terracotta/30 mx-auto"
        />

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          onClick={onSave}
          className="font-serif italic text-brown-deep/40 text-sm hover:text-brown-deep/70 transition-colors"
        >
          Done →
        </motion.button>
      </div>
    </motion.div>
  )
}
