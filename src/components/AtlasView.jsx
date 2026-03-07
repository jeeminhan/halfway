import React from 'react'
import { ArrowLeft } from 'lucide-react'
import WatercolorMap from './WatercolorMap'

export default function AtlasView({ conversations, onBack }) {
  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <div className="px-6 py-4 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-paper-mid transition-colors">
          <ArrowLeft size={18} className="text-brown-deep/50" />
        </button>
        <h1 className="font-serif text-xl font-bold text-brown-deep">Atlas</h1>
      </div>
      <div className="flex-1 min-h-0">
        <WatercolorMap
          selectedCountry={null}
          onCountryClick={() => {}}
          markers={conversations.map(c => ({ country: c.person2?.country, name: c.person2?.name }))}
        />
      </div>
    </div>
  )
}
