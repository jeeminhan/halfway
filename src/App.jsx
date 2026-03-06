import React, { useState } from 'react'
import DemoLoop from './components/DemoLoop'
import EncounterFlow from './components/EncounterFlow'
import ConversationHistory from './components/ConversationHistory'
import AtlasView from './components/AtlasView'
import OnboardingScreen from './components/OnboardingScreen'

const STORAGE_KEY = 'halfway-conversations'
const ONBOARDING_KEY = 'halfway-onboarded'

function loadConversations() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}

function saveConversations(convos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos))
}

function getInitialScreen() {
  return localStorage.getItem(ONBOARDING_KEY) ? 'home' : 'onboarding'
}

export default function App() {
  const [screen, setScreen] = useState(getInitialScreen)
  const [conversations, setConversations] = useState(loadConversations)

  const handleSave = (convo) => {
    const updated = [convo, ...conversations]
    setConversations(updated)
    saveConversations(updated)
    setScreen('home')
  }

  return (
    <div className="min-h-screen bg-parchment">
      {screen === 'onboarding' && (
        <OnboardingScreen onDone={() => setScreen('home')} />
      )}
      {screen === 'home' && (
        <DemoLoop
          hasHistory={conversations.length > 0}
          onStart={() => setScreen('encounter')}
          onHistory={() => setScreen('history')}
          onAtlas={() => setScreen('atlas')}
        />
      )}
      {screen === 'encounter' && (
        <EncounterFlow
          onSave={handleSave}
          onClose={() => setScreen('home')}
        />
      )}
      {screen === 'history' && (
        <ConversationHistory
          conversations={conversations}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'atlas' && (
        <AtlasView
          conversations={conversations}
          onBack={() => setScreen('home')}
        />
      )}
    </div>
  )
}
