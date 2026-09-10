import React, { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Heart, Bookmark, MessageCircle, Share2, Instagram } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { formatDate } from '../lib/storage.js'
import ReadingProgress from '../components/ReadingProgress.jsx'
import CommentSection from '../components/CommentSection.jsx'
import InstagramExportModal from '../components/InstagramExportModal.jsx'

const typeLabel = { poetry: 'Puisi', story: 'Cerita', quote: 'Quote' }

export default function Article() {
  const { id } = useParams()
  const { posts, getAuthor, likes, bookmarks, toggleLike, toggleBookmark, showToast } = useApp()
  const [showExport, setShowExport] = useState(false)

  const post = posts.find((p) => p.id === id)
  if (!post) return <Navigate to="/explore" replace />

  const author = getAuthor(post.authorId)
  const more = posts.filter((p) => p.authorId === post.authorId && p.id !== post.id).slice(0, 3)

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url })
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url)
      showToast('Tautan disalin')
    }
  }

  return (
    <main className="animate-fadein">
      <ReadingProgress />
      <article className="mx-auto max-w-read px-6 pt-10 md:pt-16 pb-20">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-soft)] mb-4">{typeLabel[post.type]}</p>
        <h1 className="font-display text-3xl md:text-5xl leading-tight mb-5">{post.title}</h1>
        {post.subtitle && <p className="text-lg text-[var(--text-soft)] mb-6">{post.subtitle}</p>}

        <Link to={`/profile/${author?.username}`} className="flex items-center gap-3 mb-10">
          <img src={author?.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="text-sm">oleh {author?.name}</p>
            <p className="text-xs text-[var(--text-soft)]">
              {post.readingTime || '5 menit membaca'} · {formatDate(post.createdAt)}
            </p>
          </div>
        </Link>

        {post.cover && (
          <div className="-mx-6 md:mx-0 mb-10 overflow-hidden bg-[var(--bg-soft)]">
            <img src={post.cover} alt="" className="w-full object-cover max-h-[420px]" />
          </div>
        )}

        <div className={post.type === 'poetry' || post.type === 'quote' ? 'poetry-body text-lg md:text-xl' : 'story-body text-lg'}>
          {post.type === 'story'
            ? post.content.split('\n\n').map((para, i) => <p key={i}>{para}</p>)
            : post.content}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-6 border-y border-[var(--border)] py-5">
          <button onClick={() => toggleLike(post.id)} className="inline-flex items-center gap-2 text-sm">
            <Heart size={18} className={likes[post.id] ? 'fill-wine text-wine' : 'text-[var(--text-soft)]'} />
            {post.likes}
          </button>
          <button onClick={() => toggleBookmark(post.id)} className="inline-flex items-center gap-2 text-sm">
            <Bookmark size={18} className={bookmarks[post.id] ? 'fill-[var(--text)] text-[var(--text)]' : 'text-[var(--text-soft)]'} />
            Bookmark
          </button>
          <span className="inline-flex items-center gap-2 text-sm text-[var(--text-soft)]">
            <MessageCircle size={18} /> {post.comments?.length || 0}
          </span>
          <button onClick={share} className="inline-flex items-center gap-2 text-sm text-[var(--text-soft)]">
            <Share2 size={18} /> Share
          </button>
          {post.type === 'poetry' && (
            <button
              onClick={() => setShowExport(true)}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs hover:border-[var(--text)]"
            >
              <Instagram size={15} /> Share to Instagram
            </button>
          )}
        </div>

        {more.length > 0 && (
          <div className="mt-14">
            <h3 className="font-display text-xl mb-5">More from {author?.name}</h3>
            <div className="grid gap-4">
              {more.map((p) => (
                <Link key={p.id} to={`/read/${p.id}`} className="block border-b border-[var(--border)] pb-4 hover:opacity-70">
                  <p className="text-xs text-[var(--text-soft)] mb-1">{p.category}</p>
                  <p className="font-display text-lg">{p.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <CommentSection post={post} />
      </article>

      {showExport && <InstagramExportModal post={post} author={author} onClose={() => setShowExport(false)} />}
    </main>
  )
}
