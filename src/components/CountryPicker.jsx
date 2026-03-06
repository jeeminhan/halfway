import React, { useState } from 'react'
import { motion } from 'framer-motion'
import WorldMap from './WorldMap'

export default function CountryPicker({ label, accentColor = 'terracotta', onConfirm }) {
  const [selectedCountry, setSelectedCountry] = useState('')
  const [city, setCity] = useState('')

  const highlightStats = selectedCountry
    ? { [selectedCountry]: { count: 1, people: [{ name: label }] } }
    : {}

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-4 pb-2">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accentColor === 'terracotta' ? '#C4622D' : '#7A9E7E' }}>
          {label}
        </p>
        <p className="font-serif text-xl font-bold text-brown-deep">
          {selectedCountry ? selectedCountry : 'Tap your country on the map'}
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <WorldMap
          countryStats={highlightStats}
          allCountryStats={highlightStats}
          onCountryClick={(name) => setSelectedCountry(name)}
        />
      </div>

      {selectedCountry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-4 space-y-3 bg-parchment border-t border-sand/30"
        >
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder={`City in ${selectedCountry} (optional)`}
            className="w-full bg-paper-mid border border-sand/40 rounded-xl px-4 py-3 text-brown-deep placeholder:text-brown-deep/30 focus:outline-none focus:border-terracotta text-sm"
            autoFocus
          />
          <button
            onClick={() => onConfirm({ country: selectedCountry, city: city.trim() })}
            className="w-full bg-brown-deep text-parchment py-3 rounded-2xl font-semibold hover:bg-brown-deep/90 transition-colors"
          >
            That's me →
          </button>
        </motion.div>
      )}
    </div>
  )
}
