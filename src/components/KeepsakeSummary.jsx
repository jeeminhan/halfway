// src/components/KeepsakeSummary.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Check } from 'lucide-react'

export default function KeepsakeSummary({ keepsake, topic, setting, person1, person2, audioUrl, entryNote, onClose }) {
  const [copied, setCopied] = useState(false)
  const [email1, setEmail1] = useState('')
  const [email2, setEmail2] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [scheduledLabel, setScheduledLabel] = useState('')
  const [scheduleState, setScheduleState] = useState('idle')
  const [showTranscript, setShowTranscript] = useState(false)

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

  const handleSchedule = async () => {
    const emails = [email1.trim(), email2.trim()].filter(Boolean)
    if (emails.length === 0) {
      setScheduleState('error')
      setScheduledLabel('Add at least one email, or tap Done if you want to finish without sending it.')
      return
    }

    setSubmitting(true)
    setScheduleState('idle')
    try {
      const res = await fetch('/api/schedule-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email1: email1.trim(),
          email2: email2.trim(),
          person1,
          person2,
          setting,
          topic: topic ? {
            id: topic.id,
            name: topic.name,
            question1: topic.question1,
            question2: topic.question2,
          } : null,
          halfwayPoint: keepsake.thread,
          reflection: keepsake.reflection,
          continuePrompt: keepsake.continuePrompt,
        }),
      })

      if (!res.ok) throw new Error('schedule_failed')
      const data = await res.json()
      setScheduleState('success')
      setScheduledLabel(data.daysFromNow
        ? `A follow-up question will arrive in about ${data.daysFromNow} days.`
        : 'A follow-up question is on its way for next month.')
    } catch {
      setScheduleState('error')
      setScheduledLabel('Could not schedule the email right now. You can still finish, share this, or try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const p1Label = person1.name || [person1.city, person1.country].filter(Boolean)[0] || 'You'
  const p2Label = person2.name || [person2.city, person2.country].filter(Boolean)[0] || 'Them'

  return (
    <div className="min-h-screen bg-parchment px-6 py-8 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brown-deep/35">Your Halfway Point</p>
        <p className="font-serif text-sm text-brown-deep/50 mt-1">
          {p1Label} × {p2Label}
        </p>
      </motion.div>

      {entryNote && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-300/60 bg-amber-50/70 px-4 py-3 text-sm text-brown-deep/75"
        >
          {entryNote}
        </motion.div>
      )}

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

      {(keepsake.person1Window || keepsake.person2Window) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="rounded-2xl p-5 bg-paper-mid border border-sand/40 space-y-4"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-deep/40">What opened in each other’s world</p>
          {keepsake.person1Window && (
            <div className="rounded-2xl bg-terracotta/8 border border-terracotta/15 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-terracotta mb-2">{p2Label} now sees</p>
              <p className="text-sm text-brown-deep/75 leading-relaxed">{keepsake.person1Window}</p>
            </div>
          )}
          {keepsake.person2Window && (
            <div className="rounded-2xl bg-sage/10 border border-sage/15 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-2">{p1Label} now sees</p>
              <p className="text-sm text-brown-deep/75 leading-relaxed">{keepsake.person2Window}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Reflection */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
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
          transition={{ delay: 0.34 }}
          className="rounded-2xl p-5 bg-paper-mid border border-sand/40 text-center px-4"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-deep/40 mb-3">Don’t lose the thread</p>
          <p className="font-serif italic text-brown-deep/50 text-sm leading-relaxed">
            {keepsake.continuePrompt}
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl p-5 bg-paper-mid border border-sand/40 space-y-3"
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-deep/40">
          Get This By Email
        </p>
        <p className="text-sm text-brown-deep/65 leading-relaxed">
          Leave one or both emails and Halfway will send this halfway point and reflection to your inbox. If it makes sense, a follow-up question may also arrive on its own next month. This is optional.
        </p>
        <input
          type="email"
          value={email1}
          onChange={(e) => setEmail1(e.target.value)}
          placeholder={`${p1Label}'s email (optional)`}
          className="w-full bg-parchment border border-sand/40 rounded-xl px-4 py-3 text-brown-deep placeholder:text-brown-deep/30 focus:outline-none focus:border-terracotta text-sm"
        />
        <input
          type="email"
          value={email2}
          onChange={(e) => setEmail2(e.target.value)}
          placeholder={`${p2Label}'s email (optional)`}
          className="w-full bg-parchment border border-sand/40 rounded-xl px-4 py-3 text-brown-deep placeholder:text-brown-deep/30 focus:outline-none focus:border-sage text-sm"
        />
        <button
          onClick={handleSchedule}
          disabled={submitting}
          className="w-full border border-sand/40 bg-parchment py-3.5 rounded-2xl text-sm font-semibold text-brown-deep hover:bg-sand/10 transition-colors disabled:opacity-40"
        >
          {submitting ? 'Sending...' : 'Send this by email'}
        </button>
        {scheduledLabel && (
          <p className={`text-sm italic ${scheduleState === 'error' ? 'text-terracotta' : 'text-brown-deep/55'}`}>{scheduledLabel}</p>
        )}
      </motion.div>

      {/* Audio Playback */}
      {audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
          className="rounded-2xl p-5 bg-paper-mid border border-sand/40 space-y-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-deep/40">Recording</p>
          <audio controls src={audioUrl} className="w-full h-10" />
          <a
            href={audioUrl}
            download={`halfway-${Date.now()}.webm`}
            className="inline-block text-xs text-terracotta underline underline-offset-2"
          >
            Download recording
          </a>
        </motion.div>
      )}

      {/* Transcript */}
      {keepsake.transcript && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
          className="rounded-2xl p-5 bg-paper-mid border border-sand/40 space-y-3"
        >
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-deep/40">Transcript</p>
            <span className="text-brown-deep/40 text-xs">{showTranscript ? '▲ Hide' : '▼ Show'}</span>
          </button>
          {showTranscript && (
            <p className="text-sm text-brown-deep/70 leading-relaxed whitespace-pre-wrap">{keepsake.transcript}</p>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.56 }}
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
