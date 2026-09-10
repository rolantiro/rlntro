import React from 'react'
import { useApp } from '../context/AppContext.jsx'
import PostCard from '../components/PostCard.jsx'
import QuoteCard from '../components/QuoteCard.jsx'

export default function Bookmarks() {
  const { posts, bookmarks } = useApp()
  const saved = posts.filter((p) => bookmarks[p.id])

  return (
    <main className="mx-auto max-w-3xl px-6 md:px-8 pt-10 pb-24">
      <h1 className="font-display text-3xl mb-8">Bookmarks</h1>
      {saved.length === 0 && <p className="text-sm text-[var(--text-soft)]">Belum ada tulisan yang disimpan.</p>}
      <div className="space-y-2">
        {saved.map((p) => (p.type === 'quote' ? <QuoteCard key={p.id} post={p} /> : <PostCard key={p.id} post={p} />))}
      </div>
    </main>
  )
}
