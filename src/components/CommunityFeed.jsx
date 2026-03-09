// src/components/CommunityFeed.jsx
import React, { useState } from 'react'
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'

const REACTIONS = ['✦', '🌊', '🍂', '🌙', '💬']

const MOCK_STORIES = [
  {
    id: 'mock-1',
    person1: { city: 'Lagos', country: 'Nigeria' },
    person2: { city: 'Seoul', country: 'South Korea' },
    topics: [
      { icon: '🍂', name: 'Loss' },
      { icon: '🌊', name: 'Belonging' },
      { icon: '🌙', name: 'The Unknown' },
    ],
    halfwayQuestion: 'Is there a person who could hold both the noise of Lagos and the silence of Seoul at once — and know that both are yours?',
    reactions: { '✦': 41, '🌊': 28, '🍂': 19, '🌙': 33, '💬': 12 },
    comments: [
      { id: 'c1', text: 'This question sat with me for days.', city: 'Nairobi' },
      { id: 'c2', text: 'The noise and the silence — I felt this immediately.', city: 'Busan' },
    ],
  },
  {
    id: 'mock-2',
    person1: { city: 'Karachi', country: 'Pakistan' },
    person2: { city: 'São Paulo', country: 'Brazil' },
    topics: [
      { icon: '🍂', name: 'Loss' },
      { icon: '🌊', name: 'Belonging' },
      { icon: '✨', name: 'Home' },
    ],
    halfwayQuestion: "What if the thing you're both grieving isn't a place — it's a version of yourself that only existed there?",
    reactions: { '✦': 67, '🌊': 44, '🍂': 55, '🌙': 22, '💬': 18 },
    comments: [
      { id: 'c3', text: '"A version of yourself that only existed there" — I\'ve never heard this named before.', city: 'Mexico City' },
    ],
  },
  {
    id: 'mock-3',
    person1: { city: 'Cairo', country: 'Egypt' },
    person2: { city: 'Mexico City', country: 'Mexico' },
    topics: [
      { icon: '🌙', name: 'The Unknown' },
      { icon: '🌊', name: 'Belonging' },
      { icon: '🍂', name: 'Loss' },
    ],
    halfwayQuestion: 'Could a person know you the way the call to prayer knows Cairo and the way the Zócalo holds Mexico City — completely, and without needing you to explain?',
    reactions: { '✦': 38, '🌊': 29, '🍂': 17, '🌙': 51, '💬': 9 },
    comments: [],
  },
  {
    id: 'mock-4',
    person1: { city: 'Nairobi', country: 'Kenya' },
    person2: { city: 'Reykjavik', country: 'Iceland' },
    topics: [
      { icon: '✨', name: 'Home' },
      { icon: '🍂', name: 'Loss' },
      { icon: '🌊', name: 'Belonging' },
    ],
    halfwayQuestion: "Is there someone who could be both the warmth of a Nairobi afternoon and the clarity of a Reykjavik winter — and not make you choose which one you are?",
    reactions: { '✦': 92, '🌊': 63, '🍂': 45, '🌙': 71, '💬': 31 },
    comments: [
      { id: 'c4', text: 'I read this three times before I moved on.', city: 'Oslo' },
      { id: 'c5', text: "This is the best question I've ever read.", city: 'Kampala' },
      { id: 'c6', text: 'The warmth and the clarity. Both are mine.', city: 'Akureyri' },
    ],
  },
]

function StoryCard({ story }) {
  const [reactions, setReactions] = useState(story.reactions)
  const [comments, setComments] = useState(story.comments)
  const [commentText, setCommentText] = useState('')
  const [cityText, setCityText] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [myReaction, setMyReaction] = useState(null)

  const handleReact = (emoji) => {
    if (myReaction === emoji) {
      setReactions(r => ({ ...r, [emoji]: r[emoji] - 1 }))
      setMyReaction(null)
    } else {
      if (myReaction) setReactions(r => ({ ...r, [myReaction]: r[myReaction] - 1 }))
      setReactions(r => ({ ...r, [emoji]: r[emoji] + 1 }))
      setMyReaction(emoji)
    }
  }

  const handleComment = () => {
    if (!commentText.trim()) return
    setComments(c => [...c, {
      id: `local-${Date.now()}`,
      text: commentText.trim(),
      city: cityText.trim() || null,
    }])
    setCommentText('')
    setCityText('')
  }

  return (
    <div className="ink-card border border-sand/30 overflow-hidden">
      {/* Header */}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-widest text-terracotta bg-terracotta/8 px-2 py-0.5 rounded-full">
            {story.person1.city}, {story.person1.country}
          </span>
          <span className="text-brown-deep/20 text-xs">×</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-sage bg-sage/10 px-2 py-0.5 rounded-full">
            {story.person2.city}, {story.person2.country}
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {story.topics.map((t, i) => (
            <span key={i} className="text-xs bg-sand/20 text-brown-deep/55 px-2 py-1 rounded-full">
              {t.icon} {t.name}
            </span>
          ))}
        </div>

        <p className="font-serif italic text-brown-deep text-base leading-relaxed border-l-2 border-terracotta/30 pl-3">
          "{story.halfwayQuestion}"
        </p>
      </div>

      {/* Reactions */}
      <div className="px-5 pb-3 flex gap-2 flex-wrap">
        {REACTIONS.map(emoji => (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-colors ${
              myReaction === emoji
                ? 'bg-terracotta/15 border-terracotta/40 text-terracotta'
                : 'bg-sand/10 border-sand/30 text-brown-deep/50 hover:border-sand/60'
            }`}
          >
            <span>{emoji}</span>
            <span>{reactions[emoji]}</span>
          </button>
        ))}
      </div>

      {/* Comments toggle */}
      <div className="border-t border-sand/20">
        <button
          onClick={() => setShowComments(s => !s)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs text-brown-deep/40 hover:text-brown-deep/60 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <MessageCircle size={12} />
            {comments.length} {comments.length === 1 ? 'reflection' : 'reflections'}
          </span>
          {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showComments && (
          <div className="px-5 pb-4 space-y-3">
            {comments.map(c => (
              <div key={c.id} className="space-y-0.5">
                {c.city && (
                  <p className="text-[10px] uppercase tracking-widest text-brown-deep/30 font-semibold">{c.city}</p>
                )}
                <p className="text-sm text-brown-deep/65 font-serif italic leading-relaxed">"{c.text}"</p>
              </div>
            ))}

            {/* Add comment */}
            <div className="space-y-2 pt-2 border-t border-sand/20">
              <input
                value={cityText}
                onChange={e => setCityText(e.target.value)}
                placeholder="Your city (optional)"
                className="w-full bg-paper-mid border border-sand/40 rounded-xl px-3 py-2 text-brown-deep placeholder:text-brown-deep/25 focus:outline-none focus:border-terracotta text-xs"
              />
              <div className="flex gap-2">
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Leave a reflection..."
                  rows={2}
                  className="flex-1 bg-paper-mid border border-sand/40 rounded-xl px-3 py-2 text-brown-deep placeholder:text-brown-deep/25 focus:outline-none focus:border-terracotta resize-none text-xs"
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  className="px-3 py-2 bg-brown-deep text-parchment rounded-xl text-xs font-semibold disabled:opacity-30 self-end"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CommunityFeed() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-brown-deep/30 font-serif italic text-center py-2">
        Real conversations. Shared anonymously.
      </p>
      {MOCK_STORIES.map(story => (
        <StoryCard key={story.id} story={story} />
      ))}
      <p className="text-xs text-brown-deep/20 font-serif italic text-center pb-4">
        (Demo — backend coming soon)
      </p>
    </div>
  )
}
