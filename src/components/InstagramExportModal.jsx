import React, { useEffect, useMemo, useRef, useState } from 'react'
import { X, Download, Share2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const FORMATS = [
  { key: 'story', label: 'Instagram Story', ratio: '9:16', w: 1080, h: 1920 },
  { key: 'portrait', label: 'Portrait Post', ratio: '4:5', w: 1080, h: 1350 },
  { key: 'square', label: 'Square Post', ratio: '1:1', w: 1080, h: 1080 },
]

const STYLES = {
  minimal: { bg: '#FAF6EF', text: '#2B2622', sub: '#8A6E52', font: 'Libre Baskerville, Georgia, serif' },
  dark: { bg: '#17140F', text: '#F2EBDD', sub: '#C9AE8C', font: 'Libre Baskerville, Georgia, serif' },
  paper: { bg: '#F3ECDF', text: '#2B2622', sub: '#8A6E52', font: 'Libre Baskerville, Georgia, serif', grain: true },
  editorial: { bg: '#FAF6EF', text: '#2B2622', sub: '#4B5D45', font: 'Cormorant Garamond, serif', big: true },
  photo: { bg: '#1B1815', text: '#F2EBDD', sub: '#E8DFCF', font: 'Libre Baskerville, Georgia, serif', overlay: true },
}

const PREVIEW_SCALE = 0.24

function slugify(str) {
  return (str || 'puisi')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'puisi'
}

function wrapLines(ctx, text, maxWidth) {
  const paragraphs = text.split('\n')
  const lines = []
  paragraphs.forEach((para) => {
    if (para.trim() === '') {
      lines.push('')
      return
    }
    const words = para.split(' ')
    let current = ''
    words.forEach((word) => {
      const test = current ? `${current} ${word}` : word
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current)
        current = word
      } else {
        current = test
      }
    })
    lines.push(current)
  })
  return lines
}

function paginate(lines, maxLinesPerPage) {
  const pages = []
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    pages.push(lines.slice(i, i + maxLinesPerPage))
  }
  return pages.length ? pages : [[]]
}

function drawPage(canvas, { w, h, style, lines, title, author, username, align, position, branding, coverImg, pageInfo, fontScale }) {
  const ctx = canvas.getContext('2d')
  canvas.width = w
  canvas.height = h
  const s = STYLES[style]

  // background
  if (style === 'photo' && coverImg) {
    ctx.drawImage(coverImg, 0, 0, w, h)
    ctx.fillStyle = 'rgba(15,13,10,0.45)'
    ctx.fillRect(0, 0, w, h)
  } else {
    ctx.fillStyle = s.bg
    ctx.fillRect(0, 0, w, h)
    if (s.grain) {
      ctx.fillStyle = 'rgba(0,0,0,0.02)'
      for (let i = 0; i < 400; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5)
      }
    }
  }

  const padX = w * 0.12
  const maxWidth = w - padX * 2
  const baseSize = (s.big ? w * 0.052 : w * 0.042) * fontScale
  const lineHeight = baseSize * 1.7
  const titleSize = baseSize * 0.62

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = align

  const blockHeight = lines.length * lineHeight
  let startY
  if (position === 'top') startY = h * 0.18
  else if (position === 'bottom') startY = h - blockHeight - h * 0.18
  else startY = (h - blockHeight) / 2

  const xPos = align === 'left' ? padX : align === 'right' ? w - padX : w / 2

  // category/title label
  ctx.font = `italic ${titleSize}px ${s.font}`
  ctx.fillStyle = s.sub
  if (title) {
    ctx.fillText(title.toUpperCase(), xPos, Math.max(startY - lineHeight * 0.9, h * 0.08))
  }

  ctx.font = `${baseSize}px ${s.font}`
  ctx.fillStyle = s.text
  lines.forEach((line, i) => {
    ctx.fillText(line, xPos, startY + i * lineHeight)
  })

  // author signature
  ctx.font = `italic ${titleSize}px ${s.font}`
  ctx.fillStyle = s.sub
  const authorY = Math.min(startY + blockHeight + lineHeight * 0.9, h - h * 0.1)
  ctx.fillText(`— ${author}`, xPos, authorY)

  // pagination indicator
  if (pageInfo && pageInfo.total > 1) {
    ctx.font = `${w * 0.018}px ${s.font}`
    ctx.textAlign = 'center'
    ctx.fillStyle = s.sub
    const label = String(pageInfo.index + 1).padStart(2, '0') + ' / ' + String(pageInfo.total).padStart(2, '0')
    ctx.fillText(label, w / 2, h - h * 0.045)
  }

  // branding watermark
  if (branding.show) {
    ctx.font = `${w * 0.02}px 'Cormorant Garamond', serif`
    ctx.fillStyle = s.sub
    const brandY = branding.username ? h - h * 0.065 : h - h * 0.045
    if (position === 'bottom' && (!pageInfo || pageInfo.total <= 1)) {
      // avoid overlap; keep as-is, brand sits at very bottom edge already
    }
    ctx.textAlign = 'center'
    ctx.fillText('Ruang Kata', w / 2, brandY)
    if (branding.username) {
      ctx.font = `${w * 0.016}px 'Source Sans 3', sans-serif`
      ctx.fillText(`@${username}`, w / 2, brandY + w * 0.028)
    }
  }
}

export default function InstagramExportModal({ post, author, onClose }) {
  const { showToast } = useApp()
  const [format, setFormat] = useState('portrait')
  const [style, setStyle] = useState('minimal')
  const [align, setAlign] = useState('center')
  const [position, setPosition] = useState('center')
  const [fontScale, setFontScale] = useState(1)
  const [brandingApp, setBrandingApp] = useState(true)
  const [brandingUser, setBrandingUser] = useState(true)
  const [carousel, setCarousel] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [coverImg, setCoverImg] = useState(null)

  const previewRef = useRef(null)
  const exportRef = useRef(document.createElement('canvas'))

  const activeFormat = FORMATS.find((f) => f.key === format)

  useEffect(() => {
    if (style === 'photo' && post.cover) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => setCoverImg(img)
      img.onerror = () => setCoverImg(null)
      img.src = post.cover
    } else {
      setCoverImg(null)
    }
  }, [style, post.cover])

  const pages = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = activeFormat.w
    canvas.height = activeFormat.h
    const ctx = canvas.getContext('2d')
    const baseSize = (STYLES[style].big ? activeFormat.w * 0.052 : activeFormat.w * 0.042) * fontScale
    ctx.font = `${baseSize}px ${STYLES[style].font}`
    const maxWidth = activeFormat.w - activeFormat.w * 0.12 * 2
    const lines = wrapLines(ctx, post.content, maxWidth)

    const lineHeight = baseSize * 1.7
    const reserved = activeFormat.h * 0.4 // space for title/author/branding/margins
    const maxLinesPerPage = Math.max(3, Math.floor((activeFormat.h - reserved) / lineHeight))

    if (!carousel || format === 'story') {
      // story auto-splits into multiple story pages if too long; single post = one image unless carousel toggled
      return paginate(lines, maxLinesPerPage)
    }
    return paginate(lines, maxLinesPerPage)
  }, [post.content, activeFormat, style, fontScale, carousel, format])

  const effectivePages = carousel || pages.length > 1 ? pages : [pages[0]]
  const currentLines = effectivePages[Math.min(pageIndex, effectivePages.length - 1)] || []

  useEffect(() => {
    setPageIndex(0)
  }, [format, style, carousel])

  useEffect(() => {
    if (!previewRef.current) return
    drawPage(previewRef.current, {
      w: activeFormat.w,
      h: activeFormat.h,
      style,
      lines: currentLines,
      title: post.category,
      author: author?.name,
      username: author?.username,
      align,
      position,
      branding: { show: brandingApp, username: brandingUser },
      coverImg,
      pageInfo: effectivePages.length > 1 ? { index: pageIndex, total: effectivePages.length } : null,
      fontScale,
    })
  }, [previewRef, activeFormat, style, currentLines, post.category, author, align, position, brandingApp, brandingUser, coverImg, effectivePages.length, pageIndex, fontScale])

  function renderExportCanvas(lines, pageInfo) {
    const canvas = exportRef.current
    drawPage(canvas, {
      w: activeFormat.w,
      h: activeFormat.h,
      style,
      lines,
      title: post.category,
      author: author?.name,
      username: author?.username,
      align,
      position,
      branding: { show: brandingApp, username: brandingUser },
      coverImg,
      pageInfo,
      fontScale,
    })
    return canvas
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92))
  }

  async function downloadAll() {
    const slug = slugify(post.title)
    for (let i = 0; i < effectivePages.length; i++) {
      const canvas = renderExportCanvas(effectivePages[i], effectivePages.length > 1 ? { index: i, total: effectivePages.length } : null)
      const blob = await canvasToBlob(canvas)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const suffix = effectivePages.length > 1 ? `-${i + 1}` : ''
      a.href = url
      a.download = `${slug}-instagram-${format}${suffix}.jpg`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }
    showToast(effectivePages.length > 1 ? 'Semua gambar diunduh' : 'Gambar diunduh')
  }

  async function shareCurrent() {
    const canvas = renderExportCanvas(currentLines, effectivePages.length > 1 ? { index: pageIndex, total: effectivePages.length } : null)
    const blob = await canvasToBlob(canvas)
    const slug = slugify(post.title)
    const file = new File([blob], `${slug}-instagram-${format}.jpg`, { type: 'image/jpeg' })

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: post.title })
      } catch {
        /* user cancelled */
      }
    } else {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showToast('Perangkat tidak mendukung share langsung — gambar diunduh')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-6">
      <div className="w-full md:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-[var(--bg)] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-xl">Share to Instagram</h3>
          <button onClick={onClose} aria-label="Close" className="text-[var(--text-soft)] hover:text-[var(--text)]">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div className="flex justify-center">
            <div
              className="overflow-hidden shadow-md"
              style={{ width: activeFormat.w * PREVIEW_SCALE, height: activeFormat.h * PREVIEW_SCALE }}
            >
              <canvas
                ref={previewRef}
                style={{ width: activeFormat.w * PREVIEW_SCALE, height: activeFormat.h * PREVIEW_SCALE }}
              />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--text-soft)] mb-2">Format</p>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFormat(f.key)}
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      format === f.key ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--border)] text-[var(--text-soft)]'
                    }`}
                  >
                    {f.label} · {f.ratio}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--text-soft)] mb-2">Style</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(STYLES).map((key) => (
                  <button
                    key={key}
                    onClick={() => setStyle(key)}
                    disabled={key === 'photo' && !post.cover}
                    className={`rounded-full border px-3 py-1.5 text-xs capitalize disabled:opacity-30 ${
                      style === key ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--border)] text-[var(--text-soft)]'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--text-soft)] mb-2">Align</p>
                <div className="flex gap-2">
                  {['left', 'center', 'right'].map((a) => (
                    <button
                      key={a}
                      onClick={() => setAlign(a)}
                      className={`rounded-full border px-3 py-1 text-xs capitalize ${
                        align === a ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--border)] text-[var(--text-soft)]'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--text-soft)] mb-2">Posisi</p>
                <div className="flex gap-2">
                  {['top', 'center', 'bottom'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPosition(p)}
                      className={`rounded-full border px-3 py-1 text-xs capitalize ${
                        position === p ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--border)] text-[var(--text-soft)]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--text-soft)] mb-2">Ukuran teks</p>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={fontScale}
                onChange={(e) => setFontScale(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-5 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={brandingApp} onChange={(e) => setBrandingApp(e.target.checked)} />
                "Ruang Kata"
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={brandingUser} onChange={(e) => setBrandingUser(e.target.checked)} />
                @username
              </label>
              {format !== 'story' && (
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={carousel} onChange={(e) => setCarousel(e.target.checked)} />
                  Carousel
                </label>
              )}
            </div>

            {effectivePages.length > 1 && (
              <div className="flex items-center gap-3 text-xs text-[var(--text-soft)]">
                <span>
                  Halaman {pageIndex + 1} / {effectivePages.length}
                </span>
                <button
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  disabled={pageIndex === 0}
                  className="disabled:opacity-30"
                >
                  ← Sebelumnya
                </button>
                <button
                  onClick={() => setPageIndex((p) => Math.min(effectivePages.length - 1, p + 1))}
                  disabled={pageIndex === effectivePages.length - 1}
                  className="disabled:opacity-30"
                >
                  Berikutnya →
                </button>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={downloadAll}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--text)] px-5 py-2.5 text-sm text-[var(--bg)] hover:opacity-90"
              >
                <Download size={15} /> Download JPG
              </button>
              <button
                onClick={shareCurrent}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-2.5 text-sm hover:border-[var(--text)]"
              >
                <Share2 size={15} /> Share
              </button>
            </div>
            <p className="text-xs text-[var(--text-soft)]">
              Ruang Kata tidak memposting langsung ke Instagram. Unduh atau bagikan gambar ini, lalu unggah dari aplikasi Instagram-mu.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
