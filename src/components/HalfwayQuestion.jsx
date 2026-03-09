import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function HalfwayQuestion({ question, person1, person2, onSave }) {
  const [email1, setEmail1] = useState('')
  const [email2, setEmail2] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const cities = [person1?.city || person1?.country, person2?.city || person2?.country]
    .filter(Boolean).join(' · ')

  const handleSchedule = async () => {
    if (!email1 && !email2) { onSave(); return }
    setSubmitting(true)
    try {
      await fetch('/api/schedule-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email1, email2, person1, person2,
          rounds: [], halfwayQuestion: question }),
      })
    } catch { /* silent fail */ }
    setSubmitted(true)
    setSubmitting(false)
    setTimeout(onSave, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="relative flex flex-col items-center justify-center min-h-[85vh] text-center px-2"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 45%, rgba(196, 98, 45, 0.08) 0%, transparent 70%)' }}
      />

      <div className="relative space-y-10 max-w-xs w-full">
        {cities && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="font-serif text-brown-deep/30 text-sm tracking-widest uppercase">
            {cities}
          </motion.p>
        )}

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sand">✦ Halfway Question</p>
          <p className="font-serif italic text-[1.55rem] text-brown-deep leading-snug">"{question}"</p>
        </motion.div>

        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 2.2, duration: 0.8 }}
          className="w-12 h-px bg-terracotta/30 mx-auto" />

        {/* Email follow-up section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.0 }}
          className="space-y-3 w-full">
          {!submitted ? (
            <>
              <p className="text-xs text-brown-deep/30 font-serif italic">
                Want a follow-up question in a few weeks?
              </p>
              <input
                type="email"
                value={email1}
                onChange={e => setEmail1(e.target.value)}
                placeholder={`${person1?.city || 'Your'} email (optional)`}
                className="w-full bg-paper-mid border border-sand/40 rounded-xl px-4 py-2.5 text-brown-deep placeholder:text-brown-deep/25 focus:outline-none focus:border-terracotta text-sm"
              />
              <input
                type="email"
                value={email2}
                onChange={e => setEmail2(e.target.value)}
                placeholder={`${person2?.city || 'Their'} email (optional)`}
                className="w-full bg-paper-mid border border-sand/40 rounded-xl px-4 py-2.5 text-brown-deep placeholder:text-brown-deep/25 focus:outline-none focus:border-sage text-sm"
              />
              <button
                onClick={handleSchedule}
                disabled={submitting}
                className="w-full font-serif italic text-brown-deep/40 text-sm hover:text-brown-deep/70 transition-colors py-1 disabled:opacity-40"
              >
                {submitting ? 'Scheduling...' : email1 || email2 ? 'Send it someday →' : 'Done →'}
              </button>
            </>
          ) : (
            <p className="font-serif italic text-brown-deep/40 text-sm">
              It'll arrive when it's ready. ✦
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
