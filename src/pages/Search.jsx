import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import PostCard from '../components/PostCard.jsx'
import QuoteCard from '../components/QuoteCard.jsx'
import AuthorCard from '../components/AuthorCard.jsx'

const FILTERS = ['All', 'Stories', 'Poetry', 'Quotes', 'Authors', 'Tags']

export default function Search() {
  const { posts, authors } = useApp()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const [filter, setFilter] = useState('All')

  function setQuery(v) {
    setParams(v ? { q: v } : {})
  }

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return { posts: [], authors: [] }
    const matchedPosts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(needle) ||
        p.content.toLowerCase().includes(needle) ||
        p.tags?.some((t) => t.toLowerCase().includes(needle))
    )
    const matchedAuthors = authors.filter(
      (a) => a.name.toLowerCase().includes(needle) || a.username.toLowerCase().includes(needle)
    )
    return { posts: matchedPosts, authors: matchedAuthors }
  }, [q, posts, authors])

  const filteredPosts = results.posts.filter((p) => {
    if (filter === 'All' || filter === 'Authors') return true
    if (filter === 'Stories') return p.type === 'story'
    if (filter === 'Poetry') return p.type === 'poetry'
    if (filter === 'Quotes') return p.type === 'quote'
    if (filter === 'Tags') return true
    return true
  })

  return (
    <main className="mx-auto max-w-3xl px-6 md:px-8 pt-10 pb-24">
      <div className="mb-6 flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <SearchIcon size={18} className="text-[var(--text-soft)]" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stories, poems, quotes..."
          className="flex-1 bg-transparent text-lg outline-none placeholder:text-[var(--text-soft)]"
        />
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs ${
              filter === f ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--border)] text-[var(--text-soft)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {!q && <p className="text-sm text-[var(--text-soft)]">Mulai ketik untuk mencari tulisan, penulis, atau tag.</p>}

      {q && filteredPosts.length === 0 && results.authors.length === 0 && (
        <p className="text-sm text-[var(--text-soft)]">Tidak ada hasil untuk &ldquo;{q}&rdquo;.</p>
      )}

      {(filter === 'All' || filter === 'Authors') && results.authors.length > 0 && (
        <div className="mb-10 space-y-4">
          <p className="text-xs uppercase tracking-widest text-[var(--text-soft)]">Authors</p>
          {results.authors.map((a) => <AuthorCard key={a.id} author={a} />)}
        </div>
      )}

      <div className="space-y-6">
        {filteredPosts.map((p) => (p.type === 'quote' ? <QuoteCard key={p.id} post={p} /> : <PostCard key={p.id} post={p} />))}
      </div>
    </main>
  )
}
