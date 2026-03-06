import React from 'react'
import { ArrowLeft } from 'lucide-react'

export default function ConversationHistory({ conversations, onBack }) {
  return (
    <div className="min-h-screen bg-parchment">
      <div className="px-6 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-paper-mid transition-colors">
          <ArrowLeft size={18} className="text-brown-deep/50" />
        </button>
        <h1 className="font-serif text-xl font-bold text-brown-deep">Past Conversations</h1>
      </div>

      <div className="px-6 pb-10 space-y-4 max-w-md mx-auto">
        {conversations.length === 0 ? (
          <p className="font-serif italic text-brown-deep/30 text-center mt-20 text-lg">
            No conversations yet.
          </p>
        ) : (
          conversations.map(convo => (
            <div key={convo.id} className="bg-paper-mid rounded-2xl p-5 border border-sand/30 space-y-3">
              <p className="font-serif text-brown-deep/40 text-sm tracking-wide">
                {[convo.person1?.city, convo.person2?.city].filter(Boolean).join(' · ')}
              </p>

              <div className="flex gap-2 flex-wrap">
                {convo.rounds?.map((r, i) => (
                  <span key={i} className="text-xs bg-sand/20 text-brown-deep/55 px-2 py-1 rounded-full">
                    {r.topicObj?.icon} {r.topic}
                  </span>
                ))}
              </div>

              {convo.halfwayQuestion && (
                <p className="font-serif italic text-brown-deep text-base leading-relaxed border-l-2 border-terracotta/30 pl-3">
                  "{convo.halfwayQuestion}"
                </p>
              )}

              <p className="text-xs text-brown-deep/25">
                {new Date(convo.createdAt).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
