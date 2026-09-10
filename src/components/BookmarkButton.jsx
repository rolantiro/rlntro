import React from 'react'
import { Bookmark } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function BookmarkButton({ post, size = 16 }) {
  const { bookmarks, toggleBookmark } = useApp()
  const active = !!bookmarks[post.id]

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleBookmark(post.id)
      }}
      aria-pressed={active}
      aria-label="Bookmark"
      className="inline-flex items-center gap-1.5 text-[var(--text-soft)] hover:text-[var(--text)]"
    >
      <Bookmark size={size} className={`${active ? 'fill-[var(--text)] text-[var(--text)] animate-pop' : ''} transition-colors`} />
    </button>
  )
}
