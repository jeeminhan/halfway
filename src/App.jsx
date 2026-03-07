import React, { useState } from 'react'
import DemoLoop from './components/DemoLoop'
import EncounterFlow from './components/EncounterFlow'
import ConversationHistory from './components/ConversationHistory'
import AtlasView from './components/AtlasView'
import OnboardingScreen from './components/OnboardingScreen'

const STORAGE_KEY = 'halfway-conversations'

function loadConversations() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}

function saveConversations(convos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos))
}

export default function App() {
  const [screen, setScreen] = useState('onboarding')
  const [conversations, setConversations] = useState(loadConversations)
  const [person1, setPerson1] = useState(() => {
    try { return JSON.parse(localStorage.getItem('halfway-person1')) || null }
    catch { return null }
  })

  const handleSave = (convo) => {
    const updated = [convo, ...conversations]
    setConversations(updated)
    saveConversations(updated)
  }

  return (
    <div className="min-h-screen bg-parchment">
      {screen === 'onboarding' && (
        <OnboardingScreen onDone={() => setScreen('home')} />
      )}
      {screen === 'home' && (
        <DemoLoop
          hasHistory={conversations.length > 0}
          savedPerson1={person1}
          onStart={(p1) => {
            setPerson1(p1)
            localStorage.setItem('halfway-person1', JSON.stringify(p1))
            setScreen('encounter')
          }}
          onHistory={() => setScreen('history')}
        />
      )}
      {screen === 'encounter' && (
        <EncounterFlow
          initialPerson1={person1}
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
