import React, { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Trash2, Camera } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { formatDate } from '../lib/storage.js'
import { supabase } from '../lib/supabaseClient.js'
import PostCard from '../components/PostCard.jsx'
import PoetryCard from '../components/PoetryCard.jsx'
import QuoteCard from '../components/QuoteCard.jsx'

const TABS = ['Stories', 'Poetry', 'Quotes', 'Bookmarks']

export default function Profile() {
  const { username } = useParams()
  const { authors, authorsLoading, posts, bookmarks, follows, followedBy, toggleFollow, currentUserId, updateMe, drafts, deleteDraft } = useApp()
  const [tab, setTab] = useState('Stories')
  const [editing, setEditing] = useState(false)

  const author = authors.find((a) => a.username === username)
  if (!author) {
    if (authorsLoading) return null
    return <Navigate to="/explore" replace />
  }

  const isMe = author.id === currentUserId
  const authorPosts = posts.filter((p) => p.authorId === author.id)
  const totalStories = authorPosts.length

  const tabbed =
    tab === 'Stories'
      ? authorPosts.filter((p) => p.type === 'story')
      : tab === 'Poetry'
      ? authorPosts.filter((p) => p.type === 'poetry')
      : tab === 'Quotes'
      ? authorPosts.filter((p) => p.type === 'quote')
      : posts.filter((p) => bookmarks[p.id])

  return (
    <main className="mx-auto max-w-4xl px-6 md:px-8 pt-10 pb-24">
      <div className="mb-10 flex flex-col items-center text-center">
        <img src={author.avatar} alt={author.name} className="h-24 w-24 rounded-full object-cover mb-4" />
        <h1 className="font-display text-3xl mb-1">{author.name}</h1>
        <p className="text-sm text-[var(--text-soft)] mb-3">@{author.username}{!isMe && followedBy[author.id] && <span className="ml-2 rounded-full border border-[var(--border)] px-2 py-0.5 text-xs">Mengikutimu</span>}</p>
        <p className="max-w-sm text-sm text-[var(--text-soft)] mb-5">{author.bio}</p>

        <div className="flex items-center gap-6 text-sm mb-6">
          <span><strong>{author.followers}</strong> <span className="text-[var(--text-soft)]">Followers</span></span>
          <span><strong>{author.following}</strong> <span className="text-[var(--text-soft)]">Following</span></span>
          <span><strong>{totalStories}</strong> <span className="text-[var(--text-soft)]">Stories</span></span>
        </div>

        {isMe ? (
          <button onClick={() => setEditing((v) => !v)} className="rounded-full border border-[var(--border)] px-5 py-2 text-sm hover:border-[var(--text)]">
            {editing ? 'Selesai' : 'Edit Profile'}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleFollow(author.id)}
              className={`rounded-full border px-5 py-2 text-sm ${
                follows[author.id] ? 'border-[var(--border)] text-[var(--text-soft)]' : 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
              }`}
            >
              {follows[author.id] ? (followedBy[author.id] ? 'Teman' : 'Mengikuti') : followedBy[author.id] ? 'Follow Back' : 'Follow'}
            </button>
            {follows[author.id] && followedBy[author.id] && (
              <Link to={`/chat/${author.username}`} className="rounded-full border border-[var(--border)] px-5 py-2 text-sm hover:border-[var(--text)]">
                Pesan
              </Link>
            )}
          </div>
        )}
      </div>

      {isMe && editing && (
        <EditProfileForm author={author} userId={currentUserId} onSave={async (patch) => { await updateMe(patch); setEditing(false) }} />
      )}

      <div className="mb-8 flex justify-center gap-6 border-b border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm ${tab === t ? 'border-b-2 border-[var(--text)] text-[var(--text)]' : 'text-[var(--text-soft)]'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {isMe && drafts.length > 0 && (
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--text-soft)] mb-4">Drafts</p>
          <div className="space-y-3">
            {drafts.map((d) => (
              <div key={d.id} className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <Link to={`/write/${d.id}`} className="min-w-0">
                  <p className="truncate font-display text-lg">{d.title || 'Tanpa Judul'}</p>
                  <p className="text-xs text-[var(--text-soft)]">Diperbarui {formatDate(d.updatedAt)}</p>
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm('Hapus draft ini? Tindakan ini tidak dapat dibatalkan.')) deleteDraft(d.id)
                  }}
                  aria-label="Delete draft"
                  className="shrink-0 text-[var(--text-soft)] hover:text-wine"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={tab === 'Poetry' || tab === 'Quotes' || tab === 'Bookmarks' ? 'grid gap-6 md:grid-cols-2' : 'space-y-2'}>
        {tabbed.map((p) =>
          p.type === 'quote' ? <QuoteCard key={p.id} post={p} /> : p.type === 'poetry' && tab === 'Poetry' ? <PoetryCard key={p.id} post={p} /> : <PostCard key={p.id} post={p} />
        )}
        {tabbed.length === 0 && <p className="text-sm text-[var(--text-soft)]">Belum ada tulisan di sini.</p>}
      </div>
    </main>
  )
}

// Crop tengah ke persegi 256px, JPEG — supaya file kecil (<100 KB)
function resizeAvatar(file) {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      const size = 256
      const side = Math.min(img.width, img.height)
      const c = document.createElement('canvas')
      c.width = c.height = size
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('resize gagal'))), 'image/jpeg', 0.85)
    }
    img.onerror = () => reject(new Error('File bukan gambar'))
    img.src = URL.createObjectURL(file)
  })
}

function EditProfileForm({ author, userId, onSave }) {
  const { showToast } = useApp()
  const [name, setName] = useState(author.name)
  const [bio, setBio] = useState(author.bio)
  const [blob, setBlob] = useState(null)
  const [preview, setPreview] = useState(author.avatar)
  const [saving, setSaving] = useState(false)

  async function pick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const b = await resizeAvatar(file)
      setBlob(b)
      setPreview(URL.createObjectURL(b))
    } catch (err) {
      showToast(err.message)
    }
  }

  async function save() {
    setSaving(true)
    const patch = { name, bio }
    if (blob) {
      const path = `${userId}/avatar.jpg`
      const { error } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (error) {
        setSaving(false)
        showToast('Gagal mengunggah foto')
        return
      }
      patch.avatar = `${supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl}?v=${Date.now()}`
    }
    await onSave(patch)
    setSaving(false)
  }

  return (
    <div className="mx-auto mb-10 max-w-sm space-y-4">
      <label className="relative mx-auto block h-24 w-24 cursor-pointer">
        <img src={preview} alt="" className="h-24 w-24 rounded-full object-cover" />
        <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)]">
          <Camera size={15} />
        </span>
        <input type="file" accept="image/*" onChange={pick} className="hidden" />
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border-b border-[var(--border)] bg-transparent pb-2 text-center text-sm outline-none focus:border-[var(--text)]"
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={2}
        className="w-full resize-none border-b border-[var(--border)] bg-transparent pb-2 text-center text-sm outline-none focus:border-[var(--text)]"
      />
      <button onClick={save} disabled={saving} className="w-full rounded-full bg-[var(--text)] py-2 text-sm text-[var(--bg)] disabled:opacity-50">
        {saving ? 'Menyimpan…' : 'Simpan Perubahan'}
      </button>
    </div>
  )
}
