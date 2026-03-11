// src/components/KeepsakeSummary.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Check } from 'lucide-react'

export default function KeepsakeSummary({ keepsake, person1, person2, onClose }) {
  const [copied, setCopied] = useState(false)

  const shareText = [keepsake.thread, keepsake.reflection].filter(Boolean).join('\n\n')

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
      } catch {
        // user cancelled — do nothing
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // clipboard failed silently
      }
    }
  }

  const p1Label = [person1.city, person1.country].filter(Boolean)[0] || 'You'
  const p2Label = [person2.city, person2.country].filter(Boolean)[0] || 'Them'

  return (
    <div className="min-h-screen bg-parchment px-6 py-8 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brown-deep/35">Your Halfway</p>
        <p className="font-serif text-sm text-brown-deep/50 mt-1">
          {p1Label} × {p2Label}
        </p>
      </motion.div>

      {/* Thread */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 bg-terracotta/10 border border-terracotta/20"
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-terracotta mb-3">The Thread</p>
        <p className="font-serif italic text-brown-deep leading-relaxed">{keepsake.thread}</p>
      </motion.div>

      {/* Two Windows */}
      {(keepsake.person1Window || keepsake.person2Window) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-deep/35">Two Windows</p>
          {keepsake.person1Window && (
            <div className="bg-paper-mid border border-sand/40 rounded-2xl p-4">
              <p className="text-[10px] font-semibold text-terracotta mb-1">{p1Label}</p>
              <p className="text-sm text-brown-deep/80 leading-relaxed">{keepsake.person1Window}</p>
            </div>
          )}
          {keepsake.person2Window && (
            <div className="bg-paper-mid border border-sand/40 rounded-2xl p-4">
              <p className="text-[10px] font-semibold text-sage mb-1">{p2Label}</p>
              <p className="text-sm text-brown-deep/80 leading-relaxed">{keepsake.person2Window}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Reflection */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl p-5 bg-paper-mid border border-sand/40"
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-deep/40 mb-3">A Closing Reflection</p>
        <p className="font-serif italic text-brown-deep/80 leading-relaxed text-sm">{keepsake.reflection}</p>
      </motion.div>

      {/* Continue Prompt */}
      {keepsake.continuePrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-center px-4"
        >
          <p className="font-serif italic text-brown-deep/50 text-sm leading-relaxed">
            {keepsake.continuePrompt}
          </p>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="flex gap-3 pb-8"
      >
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 border border-sand/40 bg-paper-mid py-3.5 rounded-2xl text-sm font-semibold text-brown-deep hover:bg-sand/20 transition-colors"
        >
          {copied ? <Check size={15} /> : <Share2 size={15} />}
          {copied ? 'Copied!' : 'Share'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-brown-deep text-parchment py-3.5 rounded-2xl text-sm font-semibold hover:bg-brown-deep/90 transition-colors"
        >
          Done
        </button>
      </motion.div>
    </div>
  )
}
