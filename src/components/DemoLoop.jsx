import React from 'react'
import { motion } from 'framer-motion'

export default function DemoLoop({ hasHistory, onStart, onHistory, onDemo, onSettings, savedPerson1 }) {
  const handleStart = () => {
    onStart(savedPerson1)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-end px-6 py-16 max-w-md mx-auto">

      {/* Brand + CTA */}
      <div className="w-full space-y-5 text-center">
        <div>
          <h1 className="font-serif text-5xl font-bold text-brown-deep">Halfway</h1>
          <p className="text-brown-deep/40 mt-2 text-sm italic font-serif">
            For meeting someone new and finding a real thread to keep talking.
          </p>
        </div>

        <div className="text-left rounded-2xl border border-terracotta/20 bg-terracotta/8 p-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-terracotta/70">
            Best time to use it
          </p>
          <p className="text-sm text-brown-deep/75 leading-relaxed">
            Open Halfway in the first few minutes after hello: at a cafe, after class, during an event, in line, or whenever you want to move past polite small talk quickly.
          </p>
        </div>

        <div className="text-left bg-paper-mid border border-sand/30 rounded-2xl p-4 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brown-deep/45">
            How It Works
          </p>
          <div className="space-y-2 text-sm text-brown-deep/70 leading-relaxed">
            <p><span className="font-semibold text-brown-deep">1.</span> Open it with someone you just met.</p>
            <p><span className="font-semibold text-brown-deep">2.</span> Pick one topic and let Halfway write one question for each of you.</p>
            <p><span className="font-semibold text-brown-deep">3.</span> After you talk, it gives you the halfway point worth continuing.</p>
          </div>
        </div>

        {savedPerson1 && (
          <div className="text-left space-y-2 bg-paper-mid border border-sand/30 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="font-serif font-bold text-brown-deep text-base">{savedPerson1.name}</p>
              <button onClick={onSettings} className="text-xs text-brown-deep/40 hover:text-terracotta transition-colors">
                Edit ✎
              </button>
            </div>
            <p className="text-sm text-brown-deep/60">
              {savedPerson1.city ? `${savedPerson1.city}, ` : ''}{savedPerson1.country}
              {savedPerson1.occupation ? ` · ${savedPerson1.occupation}` : ''}
            </p>
            <p className="text-sm text-brown-deep/50 leading-relaxed">
              Your side is ready. When you meet someone new, open Halfway and let it write the opening.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleStart}
            disabled={!savedPerson1?.country}
            className="w-full bg-brown-deep text-parchment py-4 rounded-2xl font-semibold text-base hover:bg-brown-deep/90 transition-colors disabled:opacity-35"
          >
            Start the Conversation
          </button>
          <p className="text-xs text-brown-deep/35 italic">
            This is for a real interaction, not just browsing the concept.
          </p>

          <motion.button
            onClick={onDemo}
            animate={{
              boxShadow: [
                '0 0 0 rgba(193, 109, 83, 0)',
                '0 0 18px rgba(193, 109, 83, 0.18)',
                '0 0 0 rgba(193, 109, 83, 0)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full border border-terracotta/60 text-terracotta py-3 rounded-2xl font-serif italic text-sm hover:border-terracotta hover:text-terracotta transition-colors flex items-center justify-center gap-2"
          >
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-terracotta"
            >
              ›
            </motion.span>
            <span>See a solo demo first</span>
            <motion.span
              animate={{ x: [0, -4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-terracotta"
            >
              ‹
            </motion.span>
          </motion.button>

          {hasHistory && (
            <button
              onClick={onHistory}
              className="w-full text-brown-deep/50 py-2 text-sm hover:text-brown-deep transition-colors font-serif italic"
            >
              Open Threads
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
