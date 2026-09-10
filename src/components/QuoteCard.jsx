import React from 'react'
import { Link } from 'react-router-dom'
import { Copy, Share2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import LikeButton from './LikeButton.jsx'
import BookmarkButton from './BookmarkButton.jsx'

export default function QuoteCard({ post }) {
  const { getAuthor, showToast } = useApp()
  const author = getAuthor(post.authorId)

  async function copyText() {
    try {
      await navigator.clipboard.writeText(`${post.content}\n\n— ${author?.name}`)
      showToast('Quote disalin')
    } catch {
      showToast('Gagal menyalin')
    }
  }

  async function share() {
    const shareData = { title: post.title, text: `${post.content}\n\n— ${author?.name}` }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        /* user cancelled */
      }
    } else {
      copyText()
    }
  }

  return (
    <div className="animate-fadein flex flex-col justify-between bg-[var(--bg-soft)] px-8 py-10 min-h-[280px]">
      <Link to={`/read/${post.id}`}>
        <p className="poetry-body text-lg md:text-xl leading-relaxed">{post.content}</p>
        <p className="mt-5 text-sm text-[var(--text-soft)]">— {author?.name}</p>
      </Link>
      <div className="mt-6 flex items-center gap-4">
        <LikeButton post={post} />
        <BookmarkButton post={post} />
        <button onClick={copyText} aria-label="Copy" className="text-[var(--text-soft)] hover:text-[var(--text)]">
          <Copy size={16} />
        </button>
        <button onClick={share} aria-label="Share" className="text-[var(--text-soft)] hover:text-[var(--text)]">
          <Share2 size={16} />
        </button>
      </div>
    </div>
  )
}
