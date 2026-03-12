import React, { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import HistoryMap from './HistoryMap'
import CommunityFeed from './CommunityFeed'

function formatConvoDate(value) {
  if (!value) return 'Recently'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getLocationLabel(person, fallback) {
  return person?.city || person?.country || fallback
}

function getFullLocation(person) {
  return [person?.city, person?.country].filter(Boolean).join(', ')
}

function getVisibleTopics(convo) {
  if (convo.topics?.length) return convo.topics
  if (convo.topic) return [convo.topic]
  return convo.rounds || []
}

function getSelectionLine(convo) {
  return convo.keepsake?.thread
    || convo.halfwayQuestion
    || convo.keepsake?.reflection
    || convo.keepsake?.continuePrompt
    || 'A thread worth revisiting.'
}

function getUniqueCountries(conversations) {
  const countries = new Set()
  conversations.forEach((convo) => {
    if (convo.person1?.country) countries.add(convo.person1.country)
    if (convo.person2?.country) countries.add(convo.person2.country)
  })
  return countries.size
}

function ThreadRail({ conversations, selectedId, onSelect }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brown-deep/40">Thread library</p>
          <p className="text-sm text-brown-deep/55">Pick a past encounter to reopen it.</p>
        </div>
        <p className="text-xs text-brown-deep/35">{conversations.length} saved</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {conversations.map((convo) => {
          const active = convo.id === selectedId
          const p1Label = getLocationLabel(convo.person1, 'You')
          const p2Label = getLocationLabel(convo.person2, 'Them')
          const topics = getVisibleTopics(convo)
          const primaryTopic = topics[0]

          return (
            <button
              key={convo.id}
              onClick={() => onSelect(convo.id)}
              className={`min-w-[17rem] max-w-[17rem] rounded-3xl border p-4 text-left transition-colors ${
                active
                  ? 'bg-brown-deep text-parchment border-brown-deep shadow-sm'
                  : 'bg-paper-mid text-brown-deep border-sand/30 hover:border-terracotta/35'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${active ? 'text-parchment/65' : 'text-brown-deep/35'}`}>
                    {formatConvoDate(convo.createdAt)}
                  </p>
                  {primaryTopic && (
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      active ? 'bg-parchment/12 text-parchment/80' : 'bg-sand/25 text-brown-deep/55'
                    }`}>
                      {primaryTopic.icon ? `${primaryTopic.icon} ` : ''}{primaryTopic.name || primaryTopic.topic}
                    </span>
                  )}
                </div>
                <p className="font-serif text-base leading-relaxed">
                  "{getSelectionLine(convo)}"
                </p>
                <p className={`text-xs ${active ? 'text-parchment/60' : 'text-brown-deep/45'}`}>
                  {p1Label} x {p2Label}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ConvoCard({ convo }) {
  const p1Label = convo.person1?.city || convo.person1?.country || 'Person 1'
  const p2Label = convo.person2?.city || convo.person2?.country || 'Person 2'
  const location1 = getFullLocation(convo.person1)
  const location2 = getFullLocation(convo.person2)
  const visibleTopics = getVisibleTopics(convo)
  const person1Answer = convo.keepsake?.person1Answer || convo.rounds?.[0]?.answer1
  const person2Answer = convo.keepsake?.person2Answer || convo.rounds?.[0]?.answer2
  const question1 = convo.topic?.question1 || convo.rounds?.[0]?.topicObj?.question1
  const question2 = convo.topic?.question2 || convo.rounds?.[0]?.topicObj?.question2
  const settingLabel = convo.setting?.name || convo.setting?.label || convo.setting?.city || ''
  const thread = convo.keepsake?.thread || convo.halfwayQuestion
  const continuePrompt = convo.keepsake?.continuePrompt
  const transcript = convo.keepsake?.transcript

  return (
    <div className="ink-card border border-sand/30 overflow-hidden">
      <div className="p-5 space-y-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brown-deep/40">
                {formatConvoDate(convo.createdAt)}
              </p>
              <p className="font-serif text-xl text-brown-deep">A saved halfway point</p>
            </div>
            {settingLabel && (
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brown-deep/55 bg-sand/20 px-3 py-1 rounded-full">
                {settingLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {location1 && (
              <span className="text-xs font-semibold uppercase tracking-widest text-terracotta bg-terracotta/8 px-2 py-0.5 rounded-full">
                {location1}
              </span>
            )}
            {location2 && (
              <span className="text-xs font-semibold uppercase tracking-widest text-sage bg-sage/10 px-2 py-0.5 rounded-full">
                {location2}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {visibleTopics.map((r, i) => (
            <span key={i} className="text-xs bg-sand/20 text-brown-deep/55 px-2 py-1 rounded-full">
              {r.icon || r.topicObj?.icon} {r.name || r.topic}
            </span>
          ))}
        </div>

        {thread && (
          <div className="rounded-3xl bg-terracotta/10 border border-terracotta/20 p-5 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-terracotta">The thread worth reopening</p>
            <p className="font-serif italic text-brown-deep text-lg leading-relaxed">"{thread}"</p>
            {continuePrompt && (
              <p className="text-sm text-brown-deep/60 leading-relaxed">
                {continuePrompt}
              </p>
            )}
          </div>
        )}

        {(question1 || question2) && (
          <div className="rounded-2xl bg-paper-mid border border-sand/40 p-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brown-deep/40">How it opened</p>
            {question1 && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-terracotta">{p1Label}</p>
                <p className="font-serif italic text-sm text-brown-deep/70 leading-relaxed">"{question1}"</p>
              </div>
            )}
            {question2 && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-sage">{p2Label}</p>
                <p className="font-serif italic text-sm text-brown-deep/70 leading-relaxed">"{question2}"</p>
              </div>
            )}
          </div>
        )}

        {(person1Answer || person2Answer) && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brown-deep/40">What each person said</p>
            {person1Answer && (
              <div className="rounded-2xl bg-terracotta/8 border border-terracotta/15 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-terracotta mb-2">{p1Label}</p>
                <p className="text-sm text-brown-deep/75 leading-relaxed">{person1Answer}</p>
              </div>
            )}
            {person2Answer && (
              <div className="rounded-2xl bg-sage/10 border border-sage/15 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-2">{p2Label}</p>
                <p className="text-sm text-brown-deep/75 leading-relaxed">{person2Answer}</p>
              </div>
            )}
          </div>
        )}

        {(convo.keepsake?.person1Window || convo.keepsake?.person2Window) && (
          <div className="rounded-2xl bg-paper-mid border border-sand/40 p-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brown-deep/40">What opened in each other's world</p>
            {convo.keepsake?.person1Window && (
              <div className="rounded-2xl bg-terracotta/8 border border-terracotta/15 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-terracotta mb-2">{p2Label} now sees</p>
                <p className="text-sm text-brown-deep/75 leading-relaxed">{convo.keepsake.person1Window}</p>
              </div>
            )}
            {convo.keepsake?.person2Window && (
              <div className="rounded-2xl bg-sage/10 border border-sage/15 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-2">{p1Label} now sees</p>
                <p className="text-sm text-brown-deep/75 leading-relaxed">{convo.keepsake.person2Window}</p>
              </div>
            )}
          </div>
        )}

        {convo.keepsake?.reflection && (
          <div className="rounded-2xl bg-paper-mid border border-sand/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-deep/40 mb-2">Why this stayed with you</p>
            <p className="font-serif italic text-sm text-brown-deep/75 leading-relaxed">{convo.keepsake.reflection}</p>
          </div>
        )}

        {transcript && (
          <details className="rounded-2xl bg-paper-mid border border-sand/40 p-4">
            <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.24em] text-brown-deep/40">
              Transcript
            </summary>
            <p className="mt-3 text-sm text-brown-deep/70 leading-relaxed whitespace-pre-wrap">{transcript}</p>
          </details>
        )}

        {convo.rounds?.length > 1 && (
          <div className="space-y-3 border-t border-sand/20 pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brown-deep/40">Rest of the conversation</p>
            {convo.rounds.map((round, i) => (
              <div key={i} className="space-y-2">
                <p className="font-serif font-bold text-brown-deep text-sm">{round.topic}</p>
                <p className="font-serif italic text-brown-deep/50 text-sm leading-relaxed">
                  "{round.topicObj?.question}"
                </p>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-terracotta">{p1Label}</p>
                  <p className="text-sm text-brown-deep/70 leading-relaxed">"{round.answer1}"</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-sage">{p2Label}</p>
                  <p className="text-sm text-brown-deep/70 leading-relaxed">"{round.answer2}"</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ConversationHistory({ conversations, onBack }) {
  const [view, setView] = useState('mine')
  const [selectedMineId, setSelectedMineId] = useState(null)
  const selectedConversation = useMemo(
    () => conversations.find(convo => convo.id === selectedMineId) || conversations[0] || null,
    [conversations, selectedMineId],
  )
  const latestConversation = conversations[0] || null
  const historyStats = useMemo(() => ({
    total: conversations.length,
    countries: getUniqueCountries(conversations),
    latestDate: latestConversation ? formatConvoDate(latestConversation.createdAt) : 'None yet',
  }), [conversations, latestConversation])

  return (
    <div className="min-h-screen bg-parchment">
      <div className="px-6 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-paper-mid transition-colors">
          <ArrowLeft size={18} className="text-brown-deep/50" />
        </button>
        <h1 className="font-serif text-xl font-bold text-brown-deep">Threads</h1>
      </div>

      <div className="px-6 mb-4 max-w-3xl mx-auto">
        <div className="flex bg-paper-mid rounded-2xl p-1 gap-1">
          <button
            onClick={() => setView('mine')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              view === 'mine' ? 'bg-parchment text-brown-deep shadow-sm' : 'text-brown-deep/40'
            }`}
          >
            My Threads
          </button>
          <button
            onClick={() => setView('community')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              view === 'community' ? 'bg-parchment text-brown-deep shadow-sm' : 'text-brown-deep/40'
            }`}
          >
            Community
          </button>
        </div>
      </div>

      <div className="px-6 pb-10 space-y-4 max-w-3xl mx-auto">
        {view === 'community' ? (
          <CommunityFeed />
        ) : conversations.length === 0 ? (
          <div className="mt-20 space-y-3 text-center">
            <p className="font-serif italic text-brown-deep/30 text-lg">
              No threads yet.
            </p>
            <p className="text-sm text-brown-deep/45 max-w-sm mx-auto leading-relaxed">
              Your past encounters will start showing up here once you finish one. This screen is meant to feel like a private keepsake shelf, not a log.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-paper-mid border border-sand/30 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brown-deep/35">Saved threads</p>
                <p className="mt-2 font-serif text-2xl text-brown-deep">{historyStats.total}</p>
              </div>
              <div className="rounded-2xl bg-paper-mid border border-sand/30 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brown-deep/35">Places held</p>
                <p className="mt-2 font-serif text-2xl text-brown-deep">{historyStats.countries}</p>
              </div>
              <div className="rounded-2xl bg-paper-mid border border-sand/30 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brown-deep/35">Last saved</p>
                <p className="mt-2 text-sm text-brown-deep/65 leading-relaxed">{historyStats.latestDate}</p>
              </div>
            </div>
            <ThreadRail
              conversations={conversations}
              selectedId={selectedConversation?.id}
              onSelect={setSelectedMineId}
            />
            <p className="text-xs text-brown-deep/35 font-serif italic text-center">
              Tap a line or point on the map to lock onto that thread, then use the card below to revisit what made it stay.
            </p>
            <HistoryMap items={conversations} activeId={selectedConversation?.id} onSelect={setSelectedMineId} />
            {selectedConversation && (
              <ConvoCard convo={selectedConversation} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
