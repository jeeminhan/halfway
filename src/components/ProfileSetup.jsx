import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { Country } from 'country-state-city'
import WatercolorMap from './WatercolorMap'

const sectionMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

export default function ProfileSetup({
  onDone,
  initialProfile,
  isEditing = false,
  heading = 'Tell us about you',
  subtitle = 'This helps us shape better conversations.',
  submitLabel,
  accentColor = 'terracotta',
  namePlaceholder = 'Your first name',
  occupationPlaceholder = 'Be specific: pediatric ER nurse, second-year architecture student, backend engineer at a fintech startup',
  occupationHint = 'Be as specific as possible.',
  countryHint = 'Tap the map or search for your country.',
  cityPlaceholder = 'City / neighborhood / area',
  cityHint = 'Type it how you would actually say it. More specific is better.',
  secondaryActionLabel,
  onSecondaryAction,
}) {
  const [name, setName] = useState(initialProfile?.name || '')
  const [country, setCountry] = useState(initialProfile?.country || '')
  const [countryIso, setCountryIso] = useState('')
  const [countrySearch, setCountrySearch] = useState(initialProfile?.country || '')
  const [city, setCity] = useState(initialProfile?.city || '')
  const [citySearch, setCitySearch] = useState(initialProfile?.city || '')
  const [occupation, setOccupation] = useState(initialProfile?.occupation || '')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  const allCountries = useMemo(() => Country.getAllCountries(), [])

  const profileName = initialProfile?.name || ''
  const profileCountry = initialProfile?.country || ''
  const profileCity = initialProfile?.city || ''
  const profileOccupation = initialProfile?.occupation || ''

  useEffect(() => {
    setName(profileName)
    setCountry(profileCountry)
    setCountrySearch(profileCountry)
    setCity(profileCity)
    setCitySearch(profileCity)
    setOccupation(profileOccupation)
  }, [profileName, profileCountry, profileCity, profileOccupation])

  useEffect(() => {
    if (!country) setCountryIso('')
  }, [country, allCountries])

  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase()
    if (!query) return []
    return allCountries
      .filter(c => c.name.toLowerCase().includes(query))
      .slice(0, 8)
  }, [countrySearch, allCountries])

  const canContinue = Boolean(name.trim() && country.trim())
  const accentTextClass = accentColor === 'sage' ? 'text-sage' : 'text-terracotta'
  const accentBorderClass = accentColor === 'sage' ? 'focus:border-sage' : 'focus:border-terracotta'
  const buttonClass = accentColor === 'sage'
    ? 'w-full bg-sage text-parchment py-4 rounded-2xl font-semibold hover:bg-sage/90 transition-colors disabled:opacity-35 disabled:cursor-not-allowed'
    : 'w-full bg-terracotta text-parchment py-4 rounded-2xl font-semibold hover:bg-terracotta/90 transition-colors disabled:opacity-35 disabled:cursor-not-allowed'

  const handleCountrySelect = (countryName, isoCode = '') => {
    const normalizedCountry = countryName || ''
    const nextIso = isoCode || allCountries.find(c => c.name === normalizedCountry)?.isoCode || ''
    const countryChanged = normalizedCountry !== country

    setCountry(normalizedCountry)
    setCountryIso(nextIso)
    setCountrySearch(normalizedCountry)
    setShowCountryDropdown(false)

    if (countryChanged) {
      setCity('')
      setCitySearch('')
    }
  }

  const handleMapCountryClick = (mapCountryName) => {
    const exact = allCountries.find(c => c.name === mapCountryName)
    const loose = allCountries.find(c =>
      c.name.toLowerCase().includes(mapCountryName.toLowerCase()) ||
      mapCountryName.toLowerCase().includes(c.name.toLowerCase()),
    )
    const match = exact || loose
    handleCountrySelect(match?.name || mapCountryName, match?.isoCode || '')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canContinue) return
    onDone({
      name: name.trim(),
      country: country.trim(),
      city: city.trim(),
      occupation: occupation.trim(),
    })
  }

  return (
    <div className="min-h-screen bg-parchment overflow-y-auto">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-10 md:py-12 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-2"
        >
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-brown-deep">{heading}</h1>
          <p className="text-brown-deep/55 text-sm md:text-base italic">
            {subtitle}
          </p>
        </motion.header>

        <motion.section
          {...sectionMotion}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="space-y-2"
        >
          <label htmlFor="profile-name" className={`text-xs font-semibold uppercase tracking-widest ${accentTextClass}`}>
            Name
          </label>
          <input
            id="profile-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={namePlaceholder}
            className={`w-full bg-paper-mid border border-sand/40 rounded-xl px-4 py-3 text-brown-deep placeholder:text-brown-deep/30 focus:outline-none text-sm ${accentBorderClass}`}
          />
        </motion.section>

        <motion.section
          {...sectionMotion}
          transition={{ duration: 0.35, delay: 0.14 }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <p className={`text-xs font-semibold uppercase tracking-widest ${accentTextClass}`}>Country</p>
            <p className="text-brown-deep/45 text-sm">{countryHint}</p>
          </div>

          <div className="relative">
            <div className="absolute top-3 left-0 right-0 px-3 z-[1000]">
              <div className="relative max-w-sm">
                <Search size={14} className="absolute left-3 top-3 text-brown-deep/35" />
                <input
                  value={countrySearch}
                  onChange={(e) => {
                    setCountrySearch(e.target.value)
                    setShowCountryDropdown(true)
                    setCountry('')
                    setCountryIso('')
                    setCity('')
                    setCitySearch('')
                  }}
                  onFocus={() => setShowCountryDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCountryDropdown(false), 120)}
                  placeholder="Search country..."
                  className={`w-full bg-parchment/95 backdrop-blur-sm border border-sand/40 rounded-xl pl-8 pr-3 py-2.5 text-brown-deep placeholder:text-brown-deep/30 focus:outline-none text-sm shadow-sm ${accentBorderClass}`}
                />
                <AnimatePresence>
                  {showCountryDropdown && filteredCountries.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full mt-1 left-0 right-0 bg-parchment border border-sand/40 rounded-xl shadow-lg overflow-hidden"
                    >
                      {filteredCountries.map((c) => (
                        <button
                          key={c.isoCode}
                          type="button"
                          onMouseDown={() => handleCountrySelect(c.name, c.isoCode)}
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

            <div className="h-[45vh] rounded-2xl overflow-hidden border border-sand/30">
              <WatercolorMap selectedCountry={country} onCountryClick={handleMapCountryClick} />
            </div>
          </div>

          <AnimatePresence>
            {country && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="space-y-2"
              >
                <p className="text-sm text-brown-deep/60">
                  Selected country: <span className={`font-semibold ${accentTextClass}`}>{country}</span>
                </p>
                <div className="relative">
                  <div className="space-y-1 mb-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brown-deep/35">Location</p>
                    <p className="text-brown-deep/45 text-sm">{cityHint}</p>
                  </div>
                  <input
                    value={citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value)
                      setCity(e.target.value)
                    }}
                    placeholder={cityPlaceholder}
                    className={`w-full bg-paper-mid border border-sand/40 rounded-xl px-4 py-3 text-brown-deep placeholder:text-brown-deep/30 focus:outline-none text-sm ${accentBorderClass}`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        <motion.section
          {...sectionMotion}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="space-y-2"
        >
          <label
            htmlFor="profile-occupation"
            className={`text-xs font-semibold uppercase tracking-widest ${accentTextClass}`}
          >
            Occupation
          </label>
          <p className="text-brown-deep/45 text-sm">{occupationHint}</p>
          <input
            id="profile-occupation"
            value={occupation}
            onChange={e => setOccupation(e.target.value)}
            placeholder={occupationPlaceholder}
            className={`w-full bg-paper-mid border border-sand/40 rounded-xl px-4 py-3 text-brown-deep placeholder:text-brown-deep/30 focus:outline-none text-sm ${accentBorderClass}`}
          />
        </motion.section>

        <motion.div
          {...sectionMotion}
          transition={{ duration: 0.35, delay: 0.26 }}
          className="pt-2 pb-6 space-y-3"
        >
          <button
            type="submit"
            disabled={!canContinue}
            className={buttonClass}
          >
            {submitLabel || (isEditing ? 'Save Changes' : 'Continue →')}
          </button>
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="w-full text-brown-deep/35 text-sm hover:text-brown-deep/60 transition-colors font-serif italic"
            >
              {secondaryActionLabel}
            </button>
          )}
        </motion.div>
      </form>
    </div>
  )
}
