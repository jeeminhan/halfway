import React, { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import HistoryMap from './HistoryMap'
import CommunityFeed from './CommunityFeed'

function ConvoCard({ convo }) {
  const p1Label = convo.person1?.city || convo.person1?.country || 'Person 1'
  const p2Label = convo.person2?.city || convo.person2?.country || 'Person 2'
  const location1 = [convo.person1?.city, convo.person1?.country].filter(Boolean).join(', ')
  const location2 = [convo.person2?.city, convo.person2?.country].filter(Boolean).join(', ')
  const visibleTopics = convo.topics?.length ? convo.topics : convo.topic ? [convo.topic] : (convo.rounds || [])
  const person1Answer = convo.keepsake?.person1Answer || convo.rounds?.[0]?.answer1
  const person2Answer = convo.keepsake?.person2Answer || convo.rounds?.[0]?.answer2

  return (
    <div className="ink-card border border-sand/30 overflow-hidden">
      <div className="p-5 space-y-4">
        <div className="space-y-1">
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
          <p className="text-xs text-brown-deep/30">
            {new Date(convo.createdAt).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {visibleTopics.map((r, i) => (
            <span key={i} className="text-xs bg-sand/20 text-brown-deep/55 px-2 py-1 rounded-full">
              {r.icon || r.topicObj?.icon} {r.name || r.topic}
            </span>
          ))}
        </div>

        {(convo.keepsake?.thread || convo.halfwayQuestion) && (
          <p className="font-serif italic text-brown-deep text-base leading-relaxed border-l-2 border-terracotta/30 pl-3">
            "{convo.keepsake?.thread || convo.halfwayQuestion}"
          </p>
        )}

        {(person1Answer || person2Answer) && (
          <div className="space-y-3">
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

        {convo.keepsake?.reflection && (
          <div className="rounded-2xl bg-paper-mid border border-sand/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-deep/40 mb-2">Reflection</p>
            <p className="font-serif italic text-sm text-brown-deep/75 leading-relaxed">{convo.keepsake.reflection}</p>
          </div>
        )}

        {convo.rounds?.length > 1 && (
          <div className="space-y-3 border-t border-sand/20 pt-4">
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
          <p className="font-serif italic text-brown-deep/30 text-center mt-20 text-lg">
            No threads yet.
          </p>
        ) : (
          <>
            <p className="text-xs text-brown-deep/35 font-serif italic text-center">
              Tap a line or point on the map to open the thread and see what both people shared.
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
