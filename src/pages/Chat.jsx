import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import AuthorCard from '../components/AuthorCard.jsx'

const time = (iso) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

export default function Chat() {
  const { username } = useParams()
  const { authors, authorsLoading, follows, followedBy, currentUserId, setAuthModalOpen } = useApp()

  if (!currentUserId) {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-16 text-center">
        <p className="mb-4 text-sm text-[var(--text-soft)]">Masuk dulu untuk mengirim pesan.</p>
        <button onClick={() => setAuthModalOpen(true)} className="rounded-full bg-[var(--text)] px-5 py-2 text-sm text-[var(--bg)]">Masuk</button>
      </main>
    )
  }

  if (username) {
    const peer = authors.find((a) => a.username === username)
    if (!peer) return authorsLoading ? null : <Navigate to="/chat" replace />
    return <Thread peer={peer} isFriend={!!(follows[peer.id] && followedBy[peer.id])} />
  }
  return <ChatList />
}

function ChatList() {
  const { authors, follows, followedBy, messages, currentUserId, refreshFollowers } = useApp()
  useEffect(() => { refreshFollowers() }, [refreshFollowers])

  const rows = useMemo(() => {
    const friends = authors.filter((a) => a.id !== currentUserId && follows[a.id] && followedBy[a.id])
    return friends
      .map((a) => {
        const thread = messages.filter((m) => m.sender_id === a.id || m.recipient_id === a.id)
        return {
          author: a,
          last: thread[thread.length - 1],
          unread: thread.filter((m) => m.recipient_id === currentUserId && !m.read_at).length,
        }
      })
      .sort((x, y) => (y.last?.created_at || '').localeCompare(x.last?.created_at || ''))
  }, [authors, follows, followedBy, messages, currentUserId])

  return (
    <main className="mx-auto max-w-2xl px-6 md:px-8 pt-10 pb-24">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl">Pesan</h1>
        <Link to="/friends" className="text-sm text-[var(--text-soft)] underline">Cari teman</Link>
      </div>

      {rows.length === 0 && (
        <p className="text-sm text-[var(--text-soft)]">
          Kamu bisa chat dengan teman, yaitu orang yang saling follow denganmu. <Link to="/friends" className="underline">Cari teman</Link> dulu.
        </p>
      )}

      <div className="divide-y divide-[var(--border)]">
        {rows.map(({ author, last, unread }) => (
          <Link key={author.id} to={`/chat/${author.username}`} className="flex items-center gap-3 py-4">
            <img src={author.avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{author.name}</p>
              <p className={`truncate text-xs ${unread ? 'text-[var(--text)]' : 'text-[var(--text-soft)]'}`}>
                {last ? `${last.sender_id === currentUserId ? 'Kamu: ' : ''}${last.text}` : 'Mulai percakapan'}
              </p>
            </div>
            {unread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-wine px-1.5 text-[10px] text-white">{unread}</span>
            )}
          </Link>
        ))}
      </div>
    </main>
  )
}

function Thread({ peer, isFriend }) {
  const { messages, currentUserId, sendMessage, markRead } = useApp()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)

  const thread = useMemo(
    () => messages.filter((m) => m.sender_id === peer.id || m.recipient_id === peer.id),
    [messages, peer.id]
  )
  const unread = thread.filter((m) => m.recipient_id === currentUserId && !m.read_at).length

  useEffect(() => { if (unread > 0) markRead(peer.id) }, [unread, peer.id, markRead])
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [thread.length])

  async function submit(e) {
    e.preventDefault()
    if (sending || !text.trim()) return
    setSending(true)
    const ok = await sendMessage(peer.id, text)
    setSending(false)
    if (ok) setText('')
  }

  return (
    <main className="mx-auto max-w-2xl px-6 md:px-8 pt-6 pb-4">
      <div className="mb-4 flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <Link to="/chat" aria-label="Kembali" className="text-[var(--text-soft)]"><ArrowLeft size={20} /></Link>
        <Link to={`/profile/${peer.username}`} className="flex min-w-0 items-center gap-3">
          <img src={peer.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{peer.name}</p>
            <p className="truncate text-xs text-[var(--text-soft)]">@{peer.username}</p>
          </div>
        </Link>
      </div>

      <div className="min-h-[40vh] space-y-2 pb-4">
        {thread.length === 0 && <p className="pt-6 text-center text-sm text-[var(--text-soft)]">Belum ada pesan. Sapa {peer.name}!</p>}
        {thread.map((m) => {
          const mine = m.sender_id === currentUserId
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'bg-[var(--text)] text-[var(--bg)]' : 'border border-[var(--border)]'}`}>
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <p className={`mt-0.5 text-right text-[10px] ${mine ? 'opacity-60' : 'text-[var(--text-soft)]'}`}>{time(m.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {isFriend ? (
        <form onSubmit={submit} className="sticky bottom-20 md:bottom-0 flex items-center gap-2 bg-[var(--bg)] py-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            placeholder="Tulis pesan…"
            className="flex-1 rounded-full border border-[var(--border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-[var(--text)]"
          />
          <button type="submit" disabled={sending || !text.trim()} aria-label="Kirim" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)] disabled:opacity-40">
            <Send size={16} />
          </button>
        </form>
      ) : (
        <div className="sticky bottom-20 md:bottom-0 space-y-3 bg-[var(--bg)] py-3">
          <p className="text-xs text-[var(--text-soft)]">Chat hanya bisa dengan teman (saling follow).</p>
          <AuthorCard author={peer} />
        </div>
      )}
    </main>
  )
}
