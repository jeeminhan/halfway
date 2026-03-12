import React, { useState } from 'react'
import DemoLoop from './components/DemoLoop'
import EncounterFlow from './components/EncounterFlow'
import ConversationHistory from './components/ConversationHistory'
import AtlasView from './components/AtlasView'
import OnboardingScreen from './components/OnboardingScreen'
import ProfileSetup from './components/ProfileSetup'

const STORAGE_KEY = 'halfway-conversations'

function loadConversations() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}

function saveConversations(convos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos))
}

function normalizePersonProfile(profile) {
  if (!profile || typeof profile !== 'object') return null

  return {
    name: profile.name || '',
    country: profile.country || '',
    city: profile.city || '',
    occupation: profile.occupation || '',
    ...(profile.isDemo ? { isDemo: true } : {}),
  }
}

export default function App() {
  const [screen, setScreen] = useState('onboarding')
  const [conversations, setConversations] = useState(loadConversations)
  const [person1, setPerson1] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('halfway-person1'))
      return normalizePersonProfile(saved)
    }
    catch { return null }
  })
  const [person2, setPerson2] = useState(null)

  const handleSave = (convo) => {
    const updated = [convo, ...conversations]
    setConversations(updated)
    saveConversations(updated)
  }

  return (
    <div className="min-h-screen bg-parchment">
      {screen === 'onboarding' && (
        <OnboardingScreen onDone={() => setScreen(person1 ? 'home' : 'profile-setup')} />
      )}
      {screen === 'profile-setup' && (
        <ProfileSetup
          onDone={(profile) => {
            const normalizedProfile = normalizePersonProfile(profile)
            setPerson1(normalizedProfile)
            localStorage.setItem('halfway-person1', JSON.stringify(normalizedProfile))
            setScreen('home')
          }}
        />
      )}
      {screen === 'home' && (
        <DemoLoop
          hasHistory={conversations.length > 0}
          savedPerson1={person1}
          onStart={(p1) => {
            const nextPerson1 = normalizePersonProfile({
              ...person1,
              ...p1,
            })
            setPerson1(nextPerson1)
            setPerson2(null)
            localStorage.setItem('halfway-person1', JSON.stringify(nextPerson1))
            setScreen('encounter')
          }}
          onDemo={() => {
            setPerson1({
              ...person1,
              isDemo: true,
            })
            setPerson2({
              name: 'Sarah',
              country: 'Canada',
              city: 'Toronto',
              occupation: 'student',
              isDemo: true,
            })
            setScreen('encounter')
          }}
          onHistory={() => setScreen('history')}
          onSettings={() => setScreen('settings')}
        />
      )}
      {screen === 'settings' && (
        <ProfileSetup
          initialProfile={person1}
          isEditing
          onDone={(profile) => {
            const normalizedProfile = normalizePersonProfile(profile)
            setPerson1(normalizedProfile)
            localStorage.setItem('halfway-person1', JSON.stringify(normalizedProfile))
            setScreen('home')
          }}
        />
      )}
      {screen === 'encounter' && (
        <EncounterFlow
          initialPerson1={person1}
          initialPerson2={person2}
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
