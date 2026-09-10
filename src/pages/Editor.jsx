import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ImagePlus, X } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { categories } from '../data/seed.js'
import FloatingToolbar from '../components/FloatingToolbar.jsx'

const AUTOSAVE_MS = 2000

export default function Editor() {
  const { draftId } = useParams()
  const navigate = useNavigate()
  const { drafts, saveDraft, deleteDraft, publishPost, showToast } = useApp()

  const existing = drafts.find((d) => d.id === draftId)

  const [title, setTitle] = useState(existing?.title || '')
  const [content, setContent] = useState(existing?.content || '')
  const [cover, setCover] = useState(existing?.cover || '')
  const [poetryMode, setPoetryMode] = useState(existing?.type === 'poetry')
  const [showPreview, setShowPreview] = useState(false)
  const [showPublish, setShowPublish] = useState(false)
  const [id] = useState(existing?.id)

  const textareaRef = useRef(null)

  // autosave draft
  useEffect(() => {
    if (!title && !content) return
    const t = setTimeout(() => {
      saveDraft({ id, title, content, cover, type: poetryMode ? 'poetry' : 'story' })
      showToast('Draft tersimpan')
    }, AUTOSAVE_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, cover, poetryMode])

  function onCoverPick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCover(reader.result)
    reader.readAsDataURL(file)
  }

  function manualSaveDraft() {
    saveDraft({ id, title, content, cover, type: poetryMode ? 'poetry' : 'story' })
    showToast('Draft disimpan')
  }

  return (
    <main className="mx-auto max-w-read px-6 pt-8 pb-28">
      <div className="mb-6 flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-xs text-[var(--text-soft)] cursor-pointer">
          <input type="checkbox" checked={poetryMode} onChange={(e) => setPoetryMode(e.target.checked)} />
          Poetry Mode
        </label>
        <div className="flex items-center gap-3">
          <button onClick={manualSaveDraft} className="text-xs text-[var(--text-soft)] hover:text-[var(--text)]">
            Save Draft
          </button>
          <button onClick={() => setShowPreview((v) => !v)} className="text-xs text-[var(--text-soft)] hover:text-[var(--text)]">
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={() => setShowPublish(true)}
            disabled={!title.trim() || !content.trim()}
            className="rounded-full bg-[var(--text)] px-4 py-1.5 text-xs text-[var(--bg)] disabled:opacity-40"
          >
            Publish
          </button>
        </div>
      </div>

      {!showPreview ? (
        <>
          {cover ? (
            <div className="relative mb-6">
              <img src={cover} alt="" className="w-full max-h-64 object-cover" />
              <button onClick={() => setCover('')} className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white">
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="mb-6 flex h-28 cursor-pointer items-center justify-center gap-2 border border-dashed border-[var(--border)] text-sm text-[var(--text-soft)] hover:border-[var(--text)]">
              <ImagePlus size={16} /> Add Cover
              <input type="file" accept="image/*" onChange={onCoverPick} className="hidden" />
            </label>
          )}

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="font-display w-full bg-transparent text-3xl md:text-4xl outline-none placeholder:text-[var(--text-soft)] mb-6"
          />

          <div className="sticky top-16 z-10 mb-4 flex justify-center md:justify-start">
            <FloatingToolbar textareaRef={textareaRef} onApply={setContent} />
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell your story..."
            rows={16}
            className={`w-full resize-none bg-transparent text-lg outline-none placeholder:text-[var(--text-soft)] ${
              poetryMode ? 'poetry-body' : 'story-body'
            }`}
          />
        </>
      ) : (
        <div className="animate-fadein">
          {cover && <img src={cover} alt="" className="w-full max-h-64 object-cover mb-6" />}
          <h1 className="font-display text-3xl md:text-4xl mb-6">{title || 'Tanpa Judul'}</h1>
          <div className={poetryMode ? 'poetry-body text-lg' : 'story-body text-lg'}>{content}</div>
        </div>
      )}

      {showPublish && (
        <PublishModal
          onClose={() => setShowPublish(false)}
          onPublish={(meta) => {
            const post = publishPost({ id, title, content, cover, type: poetryMode ? 'poetry' : 'story', ...meta })
            navigate(`/read/${post.id}`)
          }}
        />
      )}
    </main>
  )
}

function PublishModal({ onClose, onPublish }) {
  const [subtitle, setSubtitle] = useState('')
  const [category, setCategory] = useState('Poetry')
  const [tagsInput, setTagsInput] = useState('')
  const [visibility, setVisibility] = useState('public')

  function submit() {
    const tags = tagsInput
      .split(/[,\s]+/)
      .map((t) => t.replace('#', '').trim())
      .filter(Boolean)
    onPublish({ subtitle, category, tags, visibility })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50">
      <div className="w-full md:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-[var(--bg)] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-xl">Publish Story</h3>
          <button onClick={onClose} className="text-[var(--text-soft)] hover:text-[var(--text)]">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-[var(--text-soft)]">Subtitle / Description</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full border-b border-[var(--border)] bg-transparent pb-2 text-sm outline-none focus:border-[var(--text)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-[var(--text-soft)]">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.filter((c) => c !== 'All').map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    category === c ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--border)] text-[var(--text-soft)]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-[var(--text-soft)]">Tags</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="#love #sad #life"
              className="w-full border-b border-[var(--border)] bg-transparent pb-2 text-sm outline-none focus:border-[var(--text)] placeholder:text-[var(--text-soft)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-[var(--text-soft)]">Visibility</label>
            <div className="flex gap-2">
              {['public', 'unlisted', 'private'].map((v) => (
                <button
                  key={v}
                  onClick={() => setVisibility(v)}
                  className={`rounded-full border px-3 py-1 text-xs capitalize ${
                    visibility === v ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--border)] text-[var(--text-soft)]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button onClick={submit} className="w-full rounded-full bg-[var(--text)] py-3 text-sm text-[var(--bg)] hover:opacity-90">
            Publish Story
          </button>
        </div>
      </div>
    </div>
  )
}
