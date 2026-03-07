import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Country, City } from 'country-state-city'

const DEMO_STEPS = [
  { type: 'cities', content: 'Seoul · Toronto' },
  { type: 'topic', icon: '🍂', name: 'Loss', question: 'What have you left behind that still travels with you?' },
  { type: 'answer1', text: '"Hotpot with my mom — I haven\'t found anything like it here"' },
  { type: 'answer2', text: '"The feeling of walking into my home church on a Sunday morning"' },
  { type: 'halfway', text: 'What if the hotpot and the Sunday morning are actually the same hunger — and neither of them is really what you\'re looking for?' },
]

const STEP_DURATIONS = [1800, 2400, 2800, 2800, 4500]
const STEP_BLOOMS = [
  'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(212, 169, 106, 0.1) 0%, transparent 72%)',
  'radial-gradient(ellipse 70% 50% at 50% 45%, rgba(196, 98, 45, 0.1) 0%, transparent 72%)',
  'radial-gradient(ellipse 80% 55% at 40% 48%, rgba(196, 98, 45, 0.08) 0%, transparent 72%)',
  'radial-gradient(ellipse 80% 55% at 60% 48%, rgba(122, 158, 126, 0.1) 0%, transparent 72%)',
  'radial-gradient(ellipse 80% 60% at 50% 45%, rgba(212, 169, 106, 0.12) 0%, transparent 72%)',
]

export default function DemoLoop({ hasHistory, onStart, onHistory, onDemo, savedPerson1 }) {
  const [step, setStep] = useState(0)
  const [countrySearch, setCountrySearch] = useState(savedPerson1?.country || '')
  const [selectedCountry, setSelectedCountry] = useState(savedPerson1?.country || '')
  const [selectedIso, setSelectedIso] = useState('')
  const [citySearch, setCitySearch] = useState(savedPerson1?.city || '')
  const [selectedCity, setSelectedCity] = useState(savedPerson1?.city || '')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [locationSaved, setLocationSaved] = useState(!!savedPerson1?.country)

  useEffect(() => {
    const duration = STEP_DURATIONS[step] ?? 2000
    const timer = setTimeout(() => {
      setStep(s => (s + 1) % DEMO_STEPS.length)
    }, duration)
    return () => clearTimeout(timer)
  }, [step])

  const allCountries = useMemo(() => Country.getAllCountries(), [])

  // Restore ISO code for savedPerson1 so city lookup works
  useEffect(() => {
    if (savedPerson1?.country && !selectedIso) {
      const match = allCountries.find(c => c.name === savedPerson1.country)
      if (match) setSelectedIso(match.isoCode)
    }
  }, [allCountries]) // eslint-disable-line react-hooks/exhaustive-deps

  const cities = useMemo(() => {
    if (!selectedIso) return []
    return City.getCitiesOfCountry(selectedIso) || []
  }, [selectedIso])

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return []
    return allCountries
      .filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
      .slice(0, 5)
  }, [countrySearch, allCountries])

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities.slice(0, 6)
    return cities
      .filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))
      .slice(0, 6)
  }, [citySearch, cities])

  const handleCountrySelect = (name, isoCode) => {
    setSelectedCountry(name)
    setSelectedIso(isoCode)
    setCountrySearch(name)
    setShowCountryDropdown(false)
    setSelectedCity('')
    setCitySearch('')
    setLocationSaved(false)
  }

  const handleConfirmLocation = () => {
    localStorage.setItem('halfway-person1', JSON.stringify({ country: selectedCountry, city: selectedCity.trim() }))
    setLocationSaved(true)
  }

  const handleStart = () => {
    if (!selectedCountry) return
    onStart({ country: selectedCountry, city: selectedCity.trim() })
  }

  const current = DEMO_STEPS[step]

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-16 max-w-md mx-auto">
      {/* Demo area */}
      <div className="relative flex-1 flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={`bloom-${step}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: STEP_BLOOMS[step] }}
          />
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-center w-full relative"
          >
            {current.type === 'cities' && (
              <p className="font-serif text-2xl text-brown-deep/40 tracking-wide">
                {current.content}
              </p>
            )}
            {current.type === 'topic' && (
              <div className="ink-card wash-sand p-6 text-center border border-sand/30">
                <p className="text-4xl mb-3">{current.icon}</p>
                <p className="font-serif text-xl font-bold text-brown-deep mb-2">{current.name}</p>
                <p className="font-serif italic text-brown-deep/60 text-base leading-relaxed">
                  {current.question}
                </p>
              </div>
            )}
            {current.type === 'answer1' && (
              <div className="ink-card wash-terracotta p-4 text-left border border-terracotta/20">
                <p className="text-[10px] uppercase tracking-widest text-terracotta/60 mb-2 font-semibold">Seoul</p>
                <p className="font-serif italic text-brown-deep/80 text-base leading-relaxed">{current.text}</p>
              </div>
            )}
            {current.type === 'answer2' && (
              <div className="ink-card wash-sage p-4 text-left border border-sage/20">
                <p className="text-[10px] uppercase tracking-widest text-sage/70 mb-2 font-semibold">Toronto</p>
                <p className="font-serif italic text-brown-deep/80 text-base leading-relaxed">{current.text}</p>
              </div>
            )}
            {current.type === 'halfway' && (
              <div className="space-y-4 py-4">
                <div className="w-8 h-px bg-terracotta/40 mx-auto" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-sand">✦ Halfway Question</p>
                <p className="font-serif italic text-brown-deep text-xl leading-relaxed">"{current.text}"</p>
                <p className="text-[10px] text-brown-deep/30 uppercase tracking-widest">Generated by AI</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Brand + CTA */}
      <div className="w-full space-y-5 text-center">
        <div>
          <h1 className="font-serif text-5xl font-bold text-brown-deep">Halfway</h1>
          <p className="text-brown-deep/40 mt-2 text-sm italic font-serif">
            Where are you really from?
          </p>
        </div>

        {/* Your location */}
        <div className="text-left space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-terracotta px-1">You</p>

          {/* Country */}
          <div className="relative">
            <input
              value={countrySearch}
              onChange={e => {
                setCountrySearch(e.target.value)
                setShowCountryDropdown(true)
                setSelectedCountry('')
                setSelectedIso('')
                setSelectedCity('')
                setCitySearch('')
              }}
              onFocus={() => setShowCountryDropdown(true)}
              onBlur={() => setTimeout(() => setShowCountryDropdown(false), 150)}
              onKeyDown={e => {
                if (e.key === 'Enter' && filteredCountries.length > 0) {
                  handleCountrySelect(filteredCountries[0].name, filteredCountries[0].isoCode)
                }
              }}
              placeholder="Your country"
              className="w-full bg-paper-mid border border-sand/40 rounded-xl px-4 py-3 text-brown-deep placeholder:text-brown-deep/30 focus:outline-none focus:border-terracotta text-sm"
            />
            {showCountryDropdown && filteredCountries.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-parchment border border-sand/40 rounded-xl shadow-xl overflow-hidden z-20">
                {filteredCountries.map(c => (
                  <button
                    key={c.isoCode}
                    onMouseDown={() => handleCountrySelect(c.name, c.isoCode)}
                    className="w-full text-left px-4 py-2.5 text-sm text-brown-deep hover:bg-paper-mid transition-colors border-b border-sand/20 last:border-0"
                  >
                    {c.flag} {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City — only shown once country selected */}
          {selectedCountry && (
            <div className="relative">
              <input
                value={citySearch}
                onChange={e => {
                  setCitySearch(e.target.value)
                  setSelectedCity(e.target.value)
                  setShowCityDropdown(true)
                  setLocationSaved(false)
                }}
                onFocus={() => setShowCityDropdown(true)}
                onBlur={() => setTimeout(() => setShowCityDropdown(false), 150)}
                placeholder="Your city (optional)"
                className="w-full bg-paper-mid border border-sand/40 rounded-xl px-4 py-3 text-brown-deep placeholder:text-brown-deep/30 focus:outline-none focus:border-terracotta text-sm"
              />
              {showCityDropdown && filteredCities.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-parchment border border-sand/40 rounded-xl shadow-xl overflow-hidden z-20 max-h-40 overflow-y-auto">
                  {filteredCities.map(c => (
                    <button
                      key={`${c.name}-${c.stateCode}`}
                      onMouseDown={() => {
                        setSelectedCity(c.name)
                        setCitySearch(c.name)
                        setShowCityDropdown(false)
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-brown-deep hover:bg-paper-mid transition-colors border-b border-sand/20 last:border-0"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {selectedCountry && (
          <button
            onClick={handleConfirmLocation}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              locationSaved
                ? 'bg-sage/15 border-sage/30 text-sage'
                : 'bg-paper-mid border-sand/40 text-brown-deep hover:border-terracotta'
            }`}
          >
            {locationSaved ? '✓ Location saved' : 'Confirm my location'}
          </button>
        )}

        <div className="space-y-3">
          <button
            onClick={handleStart}
            disabled={!selectedCountry}
            className="w-full bg-brown-deep text-parchment py-4 rounded-2xl font-semibold text-base hover:bg-brown-deep/90 transition-colors disabled:opacity-35"
          >
            Start a Conversation
          </button>

          <button
            onClick={onDemo}
            className="w-full border border-sand/50 text-brown-deep/60 py-3 rounded-2xl font-serif italic text-sm hover:border-terracotta/40 hover:text-brown-deep transition-colors"
          >
            Try a demo
          </button>

          {hasHistory && (
            <button
              onClick={onHistory}
              className="w-full text-brown-deep/50 py-2 text-sm hover:text-brown-deep transition-colors font-serif italic"
            >
              Past Conversations
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
