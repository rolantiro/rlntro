import React from 'react'
import { Heart } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function LikeButton({ post, showCount = true, size = 16 }) {
  const { likes, toggleLike } = useApp()
  const active = !!likes[post.id]

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleLike(post.id)
      }}
      aria-pressed={active}
      aria-label="Like"
      className="inline-flex items-center gap-1.5 text-[var(--text-soft)] hover:text-wine"
    >
      <Heart
        size={size}
        className={`${active ? 'fill-wine text-wine animate-pop' : ''} transition-colors`}
      />
      {showCount && <span className="text-xs tabular-nums">{post.likes}</span>}
    </button>
  )
}
