import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import QuoteCard from '../components/QuoteCard.jsx'

const STYLES = ['Minimal', 'Paper', 'Editorial', 'Dark', 'Vintage']

export default function Quotes() {
  const { posts, publishPost } = useApp()
  const quotes = posts.filter((p) => p.type === 'quote')
  const [showCreate, setShowCreate] = useState(false)

  return (
    <main className="mx-auto max-w-5xl px-6 md:px-8 pt-10 pb-24">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl">Quotes</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-full bg-[var(--text)] px-4 py-2 text-xs text-[var(--bg)] hover:opacity-90"
        >
          Create Quote
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {quotes.map((q) => <QuoteCard key={q.id} post={q} />)}
      </div>

      {showCreate && <CreateQuoteModal onClose={() => setShowCreate(false)} onPublish={publishPost} />}
    </main>
  )
}

function CreateQuoteModal({ onClose, onPublish }) {
  const [text, setText] = useState('')
  const [style, setStyle] = useState('Minimal')

  function submit() {
    if (!text.trim()) return
    onPublish({ title: text.slice(0, 40), content: text.trim(), type: 'quote', category: 'Quotes', visibility: 'public' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50">
      <div className="w-full md:max-w-lg rounded-t-2xl md:rounded-2xl bg-[var(--bg)] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-xl">Create Quote</h3>
          <button onClick={onClose} className="text-[var(--text-soft)] hover:text-[var(--text)]">
            <X size={20} />
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis quote-mu..."
          rows={5}
          className="poetry-body w-full resize-none border-b border-[var(--border)] bg-transparent pb-3 text-lg outline-none focus:border-[var(--text)] placeholder:text-[var(--text-soft)]"
        />

        <div className="my-5 flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`rounded-full border px-3 py-1 text-xs ${
                style === s ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--border)] text-[var(--text-soft)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button onClick={submit} disabled={!text.trim()} className="w-full rounded-full bg-[var(--text)] py-3 text-sm text-[var(--bg)] disabled:opacity-40">
          Publish Quote
        </button>
      </div>
    </div>
  )
}
