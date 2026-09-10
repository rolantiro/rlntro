import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function AuthorCard({ author }) {
  const { follows, toggleFollow, currentUserId } = useApp()
  if (!author) return null
  const isMe = author.id === currentUserId
  const active = !!follows[author.id]

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
        <button
          onClick={() => toggleFollow(author.id)}
          className={`shrink-0 rounded-full border px-3 py-1 text-xs transition-colors ${
            active
              ? 'border-[var(--border)] text-[var(--text-soft)]'
              : 'border-[var(--text)] text-[var(--text)] hover:bg-[var(--text)] hover:text-[var(--bg)]'
          }`}
        >
          {active ? 'Mengikuti' : 'Follow'}
        </button>
      )}
    </div>
  )
}
