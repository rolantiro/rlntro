import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import LikeButton from './LikeButton.jsx'
import BookmarkButton from './BookmarkButton.jsx'

export default function PoetryCard({ post }) {
  const { getAuthor } = useApp()
  const author = getAuthor(post.authorId)

  return (
    <Link
      to={`/read/${post.id}`}
      className="animate-fadein block border border-[var(--border)] px-8 py-10 text-center hover:bg-[var(--bg-soft)]/50 transition-colors"
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)] mb-4">{post.category}</p>
      <h3 className="font-display text-2xl md:text-3xl leading-snug mb-4">{post.title}</h3>
      <p className="poetry-body text-sm text-[var(--text-soft)] mb-6 max-w-xs mx-auto line-clamp-4">
        {post.content}
      </p>
      <p className="text-xs text-[var(--text-soft)] mb-4">oleh {author?.name}</p>
      <div className="flex items-center justify-center gap-4">
        <LikeButton post={post} />
        <BookmarkButton post={post} />
      </div>
    </Link>
  )
}
