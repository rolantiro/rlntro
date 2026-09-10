import React from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { formatDate } from '../lib/storage.js'
import LikeButton from './LikeButton.jsx'
import BookmarkButton from './BookmarkButton.jsx'

export default function PostCard({ post, variant = 'row' }) {
  const { getAuthor } = useApp()
  const author = getAuthor(post.authorId)

  if (variant === 'feature') {
    return (
      <Link to={`/read/${post.id}`} className="group block">
        {post.cover && (
          <div className="mb-4 overflow-hidden bg-[var(--bg-soft)] aspect-[16/10]">
            <img
              src={post.cover}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        )}
        <p className="text-xs uppercase tracking-widest text-[var(--text-soft)] mb-2">{post.category}</p>
        <h3 className="font-display text-2xl md:text-3xl leading-snug mb-2 group-hover:opacity-70 transition-opacity">
          {post.title}
        </h3>
        <p className="text-sm text-[var(--text-soft)] line-clamp-2 mb-3">{post.excerpt}</p>
        <div className="flex items-center gap-2 text-xs text-[var(--text-soft)]">
          <img src={author?.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
          <span>{author?.name}</span>
          <span>·</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/read/${post.id}`} className="group flex gap-5 py-6 border-b border-[var(--border)] last:border-0">
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2 text-xs text-[var(--text-soft)]">
          <img src={author?.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
          <span>{author?.name}</span>
          <span>·</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <h3 className="font-display text-xl md:text-2xl leading-snug mb-1.5 group-hover:opacity-70 transition-opacity">
          {post.title}
        </h3>
        <p className="text-sm text-[var(--text-soft)] line-clamp-2 mb-3">{post.excerpt}</p>
        <div className="flex items-center gap-4 text-xs text-[var(--text-soft)]">
          <span className="uppercase tracking-wide">{post.category}</span>
          <span>{post.readingTime || '3 menit membaca'}</span>
          <LikeButton post={post} />
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle size={15} /> {post.comments?.length || 0}
          </span>
          <BookmarkButton post={post} />
        </div>
      </div>
      {post.cover && (
        <div className="hidden sm:block h-24 w-24 shrink-0 overflow-hidden bg-[var(--bg-soft)]">
          <img src={post.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
        </div>
      )}
    </Link>
  )
}
