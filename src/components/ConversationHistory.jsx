import React, { useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import HistoryMap from './HistoryMap'
import CommunityFeed from './CommunityFeed'

function ConvoCard({ convo }) {
  const [expanded, setExpanded] = useState(false)

  const p1Label = convo.person1?.city || convo.person1?.country || 'Person 1'
  const p2Label = convo.person2?.city || convo.person2?.country || 'Person 2'
  const location1 = [convo.person1?.city, convo.person1?.country].filter(Boolean).join(', ')
  const location2 = [convo.person2?.city, convo.person2?.country].filter(Boolean).join(', ')

  return (
    <div className="ink-card border border-sand/30 overflow-hidden">
      {/* Header */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
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
                month: 'long', day: 'numeric', year: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-brown-deep/30 hover:text-brown-deep/60 transition-colors p-1 shrink-0"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Topics row */}
        <div className="flex gap-2 flex-wrap">
          {convo.rounds?.map((r, i) => (
            <span key={i} className="text-xs bg-sand/20 text-brown-deep/55 px-2 py-1 rounded-full">
              {r.topicObj?.icon} {r.topic}
            </span>
          ))}
        </div>

        {/* Halfway question always visible */}
        {convo.halfwayQuestion && (
          <p className="font-serif italic text-brown-deep text-base leading-relaxed border-l-2 border-terracotta/30 pl-3">
            "{convo.halfwayQuestion}"
          </p>
        )}
      </div>

      {/* Expanded Q&A */}
      {expanded && convo.rounds?.length > 0 && (
        <div className="border-t border-sand/20 divide-y divide-sand/15">
          {convo.rounds.map((round, i) => (
            <div key={i} className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{round.topicObj?.icon}</span>
                <p className="font-serif font-bold text-brown-deep text-sm">{round.topic}</p>
              </div>
              <p className="font-serif italic text-brown-deep/50 text-sm leading-relaxed">
                "{round.topicObj?.question}"
              </p>
              <div className="space-y-2 pl-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-terracotta">{p1Label}</p>
                  <p className="text-sm text-brown-deep/70 leading-relaxed">"{round.answer1}"</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-sage">{p2Label}</p>
                  <p className="text-sm text-brown-deep/70 leading-relaxed">"{round.answer2}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ConversationHistory({ conversations, onBack }) {
  const [view, setView] = useState('mine')

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-paper-mid transition-colors">
          <ArrowLeft size={18} className="text-brown-deep/50" />
        </button>
        <h1 className="font-serif text-xl font-bold text-brown-deep">
          {view === 'mine' ? 'Past Conversations' : 'Community'}
        </h1>
      </div>

      {/* Toggle */}
      <div className="px-6 mb-4 max-w-md mx-auto">
        <div className="flex bg-paper-mid rounded-2xl p-1 gap-1">
          <button
            onClick={() => setView('mine')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              view === 'mine' ? 'bg-parchment text-brown-deep shadow-sm' : 'text-brown-deep/40'
            }`}
          >
            My Conversations
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

      <div className="px-6 pb-10 space-y-4 max-w-md mx-auto">
        {view === 'community' ? (
          <CommunityFeed />
        ) : conversations.length === 0 ? (
          <p className="font-serif italic text-brown-deep/30 text-center mt-20 text-lg">
            No conversations yet.
          </p>
        ) : (
          <>
            <HistoryMap conversations={conversations} />
            {conversations.map(convo => (
              <ConvoCard key={convo.id} convo={convo} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
