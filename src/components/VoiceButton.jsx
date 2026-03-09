// src/components/VoiceButton.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { motion } from 'framer-motion'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export default function VoiceButton({ onTranscript, accentColor = 'terracotta' }) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  if (!SpeechRecognition) return null

  const accentHex = accentColor === 'sage' ? '#7A9E7E' : '#C4622D'

  const startListening = () => {
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('')
      onTranscript(transcript)
    }

    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  useEffect(() => () => recognitionRef.current?.stop(), [])

  return (
    <button
      type="button"
      onClick={listening ? stopListening : startListening}
      className="p-2 rounded-full transition-colors"
      style={{ color: listening ? accentHex : undefined }}
      title={listening ? 'Stop recording' : 'Speak your answer'}
    >
      {listening ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <MicOff size={16} style={{ color: accentHex }} />
        </motion.div>
      ) : (
        <Mic size={16} className="text-brown-deep/30 hover:text-brown-deep/60" />
      )}
    </button>
  )
}
