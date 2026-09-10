import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { formatDate } from '../lib/storage.js'

export default function CommentSection({ post }) {
  const { getAuthor, addComment } = useApp()
  const [text, setText] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    addComment(post.id, text.trim())
    setText('')
  }

  return (
    <div className="mt-14">
      <h3 className="font-display text-xl mb-5">Komentar ({post.comments?.length || 0})</h3>

      <form onSubmit={submit} className="mb-8 flex gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Bagikan tanggapanmu..."
          className="flex-1 border-b border-[var(--border)] bg-transparent pb-2 text-sm outline-none focus:border-[var(--text)] placeholder:text-[var(--text-soft)]"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="text-sm text-[var(--accent)] disabled:text-[var(--text-soft)] disabled:cursor-not-allowed"
        >
          Kirim
        </button>
      </form>

      <div className="space-y-6">
        {(post.comments || []).map((c) => {
          const a = getAuthor(c.authorId)
          return (
            <div key={c.id} className="flex gap-3">
              <img src={a?.avatar} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
              <div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-soft)]">
                  <span className="font-medium text-[var(--text)]">{a?.name}</span>
                  <span>{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm mt-1">{c.text}</p>
              </div>
            </div>
          )
        })}
        {(!post.comments || post.comments.length === 0) && (
          <p className="text-sm text-[var(--text-soft)]">Jadilah yang pertama memberi tanggapan.</p>
        )}
      </div>
    </div>
  )
}
