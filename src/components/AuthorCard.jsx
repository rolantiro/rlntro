import React from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function AuthorCard({ author }) {
  const { follows, followedBy, toggleFollow, currentUserId } = useApp()
  if (!author) return null
  const isMe = author.id === currentUserId
  const active = !!follows[author.id]
  const followsMe = !!followedBy[author.id]
  const isFriend = active && followsMe

  return (
    <div className="flex items-center justify-between gap-3">
      <Link to={`/profile/${author.username}`} className="flex items-center gap-3 min-w-0">
        <img src={author.avatar} alt={author.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{author.name}</p>
          <p className="text-xs text-[var(--text-soft)] truncate">@{author.username}</p>
        </div>
      </Link>
      {!isMe && (
        <div className="flex shrink-0 items-center gap-2">
          {isFriend && (
            <Link to={`/chat/${author.username}`} aria-label="Kirim pesan" className="text-[var(--text-soft)] hover:text-[var(--text)]">
              <MessageCircle size={18} />
            </Link>
          )}
          <button
            onClick={() => toggleFollow(author.id)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              active
                ? 'border-[var(--border)] text-[var(--text-soft)]'
                : followsMe
                ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
                : 'border-[var(--text)] text-[var(--text)] hover:bg-[var(--text)] hover:text-[var(--bg)]'
            }`}
          >
            {active ? (isFriend ? 'Teman' : 'Mengikuti') : followsMe ? 'Follow Back' : 'Follow'}
          </button>
        </div>
      )}
    </div>
  )
}
