import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { poetryCategories } from '../data/seed.js'
import CategoryFilter from '../components/CategoryFilter.jsx'
import PoetryCard from '../components/PoetryCard.jsx'

export default function Poetry() {
  const { posts } = useApp()
  const [category, setCategory] = useState('All')

  const poems = posts.filter((p) => p.type === 'poetry')
  const filtered = category === 'All' ? poems : poems.filter((p) => p.tags?.includes(category.toLowerCase()))

  return (
    <main className="mx-auto max-w-5xl px-6 md:px-8 pt-10 pb-24">
      <h1 className="font-display text-3xl mb-2">Poetry</h1>
      <p className="text-sm text-[var(--text-soft)] mb-8">Kumpulan puisi dari seluruh penulis Ruang Kata.</p>

      <div className="mb-10">
        <CategoryFilter options={['All', ...poetryCategories]} value={category} onChange={setCategory} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((p) => <PoetryCard key={p.id} post={p} />)}
        {filtered.length === 0 && <p className="text-sm text-[var(--text-soft)]">Belum ada puisi di kategori ini.</p>}
      </div>
    </main>
  )
}
