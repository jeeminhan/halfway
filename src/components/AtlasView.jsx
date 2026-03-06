import React, { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import WorldMap from './WorldMap'

export default function AtlasView({ conversations, onBack }) {
  const countryStats = useMemo(() => {
    const stats = {}
    conversations.forEach(convo => {
      const country = convo.person2?.country
      if (!country) return
      if (!stats[country]) stats[country] = { count: 0, people: [] }
      stats[country].count += 1
      stats[country].people.push({ name: convo.person2?.name || 'Someone' })
    })
    return stats
  }, [conversations])

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <div className="px-6 py-4 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-paper-mid transition-colors">
          <ArrowLeft size={18} className="text-brown-deep/50" />
        </button>
        <h1 className="font-serif text-xl font-bold text-brown-deep">Atlas</h1>
      </div>
      <div className="flex-1">
        <WorldMap
          countryStats={countryStats}
          allCountryStats={countryStats}
          onCountryClick={() => {}}
        />
      </div>
    </div>
  )
}
