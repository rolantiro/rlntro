import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import PostCard from '../components/PostCard.jsx'

export default function Landing() {
  const { posts } = useApp()
  const featured = posts.slice(0, 3)

  return (
    <main>
      <section className="mx-auto max-w-4xl px-6 md:px-8 pt-16 md:pt-28 pb-16 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-soft)] mb-6">Ruang Kata</p>
        <h1 className="font-display text-4xl md:text-6xl leading-[1.15] mb-6">
          Tempat kata-kata<br />menemukan rumah.
        </h1>
        <p className="text-[var(--text-soft)] max-w-md mx-auto mb-10 text-base md:text-lg">
          Tulis puisi, cerita, dan hal-hal kecil yang ingin kamu abadikan.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/write" className="rounded-full bg-[var(--text)] px-6 py-3 text-sm text-[var(--bg)] hover:opacity-90">
            Mulai Menulis
          </Link>
          <Link to="/explore" className="rounded-full border border-[var(--border)] px-6 py-3 text-sm hover:border-[var(--text)]">
            Jelajahi Tulisan
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 md:px-8 pb-24">
        <p className="text-xs uppercase tracking-widest text-[var(--text-soft)] mb-8">Tulisan Pilihan</p>
        <div className="grid gap-10 md:grid-cols-3">
          {featured.map((p) => (
            <PostCard key={p.id} post={p} variant="feature" />
          ))}
        </div>
      </section>
    </main>
  )
}
