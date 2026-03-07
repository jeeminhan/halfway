import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { Country } from 'country-state-city'
import WatercolorMap from './WatercolorMap'

export default function CountryPicker({ label, accentColor = 'terracotta', onConfirm }) {
  const [selectedCountry, setSelectedCountry] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [city, setCity] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const allCountries = useMemo(() => Country.getAllCountries(), [])

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return []
    return allCountries
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 6)
  }, [searchTerm, allCountries])

  const accentHex = accentColor === 'sage' ? '#7A9E7E' : '#C4622D'

  const handleCountrySelect = (name) => {
    setSelectedCountry(name)
    setSearchTerm(name)
    setShowDropdown(false)
    setCity('')
  }

  return (
    <div className="relative flex flex-col h-full">
      <div className="absolute top-4 left-4 z-[1000]">
        <span
          className="text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full bg-parchment/90 backdrop-blur-sm"
          style={{ color: accentHex }}
        >
          {label}
        </span>
      </div>

      <div className="absolute top-4 left-0 right-0 z-[1000] px-4 flex justify-center">
        <div className="relative w-full max-w-xs ml-16">
          <Search size={14} className="absolute left-3 top-3 text-brown-deep/40" />
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowDropdown(true)
              setSelectedCountry('')
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search country..."
            className="w-full bg-parchment/90 backdrop-blur-sm border border-sand/50 rounded-xl pl-8 pr-3 py-2.5 text-brown-deep placeholder:text-brown-deep/30 focus:outline-none focus:border-terracotta text-sm shadow-sm"
          />
          <AnimatePresence>
            {showDropdown && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full mt-1 left-0 right-0 bg-parchment/95 backdrop-blur-sm border border-sand/40 rounded-xl shadow-lg overflow-hidden z-[1001]"
              >
                {filtered.map(c => (
                  <button
                    key={c.isoCode}
                    onClick={() => handleCountrySelect(c.name)}
                    className="w-full text-left px-4 py-2.5 text-sm text-brown-deep hover:bg-paper-mid transition-colors border-b border-sand/20 last:border-0"
                  >
                    {c.flag} {c.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <WatercolorMap
          selectedCountry={selectedCountry}
          onCountryClick={handleCountrySelect}
        />
      </div>

      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-parchment/95 backdrop-blur-md border-t border-sand/30 px-5 py-4 space-y-3 z-[1000]"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <span className="font-serif font-bold text-brown-deep text-lg">{selectedCountry}</span>
            </div>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Which city? (optional)"
              className="w-full bg-paper-mid border border-sand/40 rounded-xl px-4 py-2.5 text-brown-deep placeholder:text-brown-deep/30 focus:outline-none text-sm"
              autoFocus
            />
            <button
              onClick={() => onConfirm({ country: selectedCountry, city: city.trim() })}
              className="w-full text-parchment py-3 rounded-2xl font-semibold transition-colors text-sm"
              style={{ backgroundColor: accentHex }}
            >
              {label === 'You' ? "That's me →" : "That's them →"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
