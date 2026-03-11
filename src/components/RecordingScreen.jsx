// src/components/RecordingScreen.jsx
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square } from 'lucide-react'

const MAX_SECONDS = 5 * 60  // 5 minutes
const WARN_AT = 4 * 60       // warn at 4 minutes

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function RecordingScreen({ topics, person1, person2, onFinish, onClose }) {
  const [hasRecorder] = useState(() =>
    typeof MediaRecorder !== 'undefined' && !!navigator?.mediaDevices?.getUserMedia
  )
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [fallbackText, setFallbackText] = useState('')
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.start(1000)
      setRecording(true)
      setElapsed(0)

      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev + 1 >= MAX_SECONDS) {
            stopRecording()
            return MAX_SECONDS
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      console.error('Microphone access denied:', err)
    }
  }

  const stopRecording = () => {
    clearInterval(intervalRef.current)
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    setRecording(false)
    setHasRecorded(true)
  }

  const handleFinish = async () => {
    if (hasRecorder && chunksRef.current.length > 0) {
      // Wait for final ondataavailable chunk
      await new Promise(r => setTimeout(r, 300))
      const mimeType = recorderRef.current?.mimeType || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type: mimeType })
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]
        onFinish({ audioBase64: base64, audioMimeType: mimeType })
      }
      reader.readAsDataURL(blob)
    } else if (!hasRecorder && fallbackText.trim()) {
      onFinish({ transcript: fallbackText.trim() })
    }
  }

  const handleBackRequest = () => {
    if (recording) stopRecording()
    setShowBackConfirm(true)
  }

  const canFinish = hasRecorder
    ? (hasRecorded && chunksRef.current.length > 0)
    : fallbackText.trim().length > 10

  return (
    <div className="h-screen bg-parchment flex flex-col relative">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 shrink-0">
        <span className="font-serif text-lg font-bold text-brown-deep">Halfway</span>
        <button
          onClick={handleBackRequest}
          className="p-2 rounded-full hover:bg-paper-mid transition-colors"
        >
          <span className="text-brown-deep/40 text-sm">✕</span>
        </button>
      </div>

      {/* Topic prompts */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">
        {topics.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-5 border"
            style={{
              background: `linear-gradient(135deg, ${topic.color}14 0%, #EDE5D0 65%)`,
              borderColor: topic.color + '30',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{topic.icon}</span>
              <span className="font-serif font-bold text-brown-deep text-sm">{topic.name}</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-terracotta mb-1">
                  {person1.city || person1.country || 'You'}
                </p>
                <p className="font-serif italic text-brown-deep/70 text-sm leading-relaxed">
                  "{topic.question1 || topic.question}"
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-1">
                  {person2.city || person2.country || 'Them'}
                </p>
                <p className="font-serif italic text-brown-deep/70 text-sm leading-relaxed">
                  "{topic.question2 || topic.question}"
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Text fallback */}
        {!hasRecorder && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-brown-deep/50 italic">
              Voice recording isn't available on this browser. Type a summary of your conversation instead.
            </p>
            <textarea
              value={fallbackText}
              onChange={e => setFallbackText(e.target.value)}
              placeholder="What did you talk about?"
              rows={5}
              className="w-full bg-paper-mid border border-sand/40 rounded-xl p-3 text-brown-deep placeholder:text-brown-deep/25 focus:outline-none focus:border-terracotta resize-none text-sm"
            />
          </div>
        )}
      </div>

      {/* Recording controls */}
      {hasRecorder && (
        <div className="px-6 pt-2 shrink-0">
          <AnimatePresence>
            {elapsed >= WARN_AT && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-brown-deep/40 italic mb-2"
              >
                Wrapping up soon…
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-center gap-6 mb-3">
            <span className="font-mono text-sm text-brown-deep/40 w-12 text-right">
              {formatTime(elapsed)}
            </span>

            {!recording ? (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-terracotta flex items-center justify-center shadow-lg"
              >
                <Mic size={24} className="text-parchment" />
              </motion.button>
            ) : (
              <motion.button
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                whileTap={{ scale: 0.92 }}
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-brown-deep flex items-center justify-center shadow-lg"
              >
                <Square size={20} className="text-parchment fill-parchment" />
              </motion.button>
            )}

            <span className="w-12" />
          </div>
        </div>
      )}

      {/* Finish button */}
      <div className="px-6 pb-8 shrink-0">
        <button
          onClick={handleFinish}
          disabled={!canFinish}
          className="w-full bg-brown-deep text-parchment py-4 rounded-2xl font-semibold disabled:opacity-30 hover:bg-brown-deep/90 transition-colors"
        >
          Finish Conversation →
        </button>
      </div>

      {/* Back confirmation overlay */}
      <AnimatePresence>
        {showBackConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brown-deep/60 flex items-end z-50"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full bg-parchment rounded-t-3xl p-6 space-y-4"
            >
              <p className="font-serif text-lg font-bold text-brown-deep text-center">
                Discard this recording?
              </p>
              <p className="text-brown-deep/60 text-sm text-center">
                Your conversation won't be saved.
              </p>
              <button
                onClick={() => onFinish({ discard: true })}
                className="w-full bg-brown-deep text-parchment py-3 rounded-2xl font-semibold"
              >
                Yes, discard
              </button>
              <button
                onClick={() => setShowBackConfirm(false)}
                className="w-full text-brown-deep/50 py-3 text-sm"
              >
                Keep recording
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
