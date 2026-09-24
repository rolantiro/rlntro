import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import AuthorCard from '../components/AuthorCard.jsx'

const TABS = ['Teman', 'Pengikut', 'Mengikuti']
const EMPTY = {
  Teman: 'Belum ada teman. Teman = kalian saling follow. Cari penulis di atas, lalu follow.',
  Pengikut: 'Belum ada yang mengikutimu.',
  Mengikuti: 'Kamu belum mengikuti siapa pun.',
}

export default function Friends() {
  const { authors, follows, followedBy, currentUserId, setAuthModalOpen, refreshFollowers } = useApp()
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('Teman')

  useEffect(() => { refreshFollowers() }, [refreshFollowers])

  if (!currentUserId) {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-16 text-center">
        <p className="mb-4 text-sm text-[var(--text-soft)]">Masuk dulu untuk mencari dan berteman.</p>
        <button onClick={() => setAuthModalOpen(true)} className="rounded-full bg-[var(--text)] px-5 py-2 text-sm text-[var(--bg)]">Masuk</button>
      </main>
    )
  }

  const others = authors.filter((a) => a.id !== currentUserId)
  const groups = {
    Teman: others.filter((a) => follows[a.id] && followedBy[a.id]),
    Pengikut: others.filter((a) => followedBy[a.id]),
    Mengikuti: others.filter((a) => follows[a.id]),
  }
  const needle = q.trim().toLowerCase()
  const list = needle
    ? others.filter((a) => a.name.toLowerCase().includes(needle) || a.username.toLowerCase().includes(needle))
    : groups[tab]

  return (
    <main className="mx-auto max-w-2xl px-6 md:px-8 pt-10 pb-24">
      <div className="mb-6 flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <Search size={18} className="text-[var(--text-soft)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari teman lewat nama atau @username"
          className="flex-1 bg-transparent text-base outline-none placeholder:text-[var(--text-soft)]"
        />
      </div>

      {!needle && (
        <div className="mb-8 flex gap-6 border-b border-[var(--border)]">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm ${tab === t ? 'border-b-2 border-[var(--text)] text-[var(--text)]' : 'text-[var(--text-soft)]'}`}
            >
              {t} <span className="text-xs">{groups[t].length}</span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-5">
        {list.map((a) => <AuthorCard key={a.id} author={a} />)}
        {list.length === 0 && (
          <p className="text-sm text-[var(--text-soft)]">{needle ? `Tidak ada yang cocok dengan “${q}”.` : EMPTY[tab]}</p>
        )}
      </div>
    </main>
  )
}
