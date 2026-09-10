import React from 'react'
import { Bold, Italic, Underline, Quote, Heading, Link2, Image, Code } from 'lucide-react'

const actions = [
  { key: 'bold', icon: Bold, wrap: '**' },
  { key: 'italic', icon: Italic, wrap: '*' },
  { key: 'underline', icon: Underline, wrap: '_' },
  { key: 'quote', icon: Quote, line: '> ' },
  { key: 'heading', icon: Heading, line: '## ' },
  { key: 'link', icon: Link2, wrap: '[', wrapEnd: '](url)' },
  { key: 'image', icon: Image, line: '![alt](image-url)' },
  { key: 'code', icon: Code, wrap: '`' },
]

export default function FloatingToolbar({ textareaRef, onApply }) {
  function apply(action) {
    const el = textareaRef.current
    if (!el) return
    const { selectionStart, selectionEnd, value } = el
    const selected = value.slice(selectionStart, selectionEnd)
    let next

    if (action.line) {
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
      next = value.slice(0, lineStart) + action.line + value.slice(lineStart)
    } else {
      const wrapEnd = action.wrapEnd ?? action.wrap
      next = value.slice(0, selectionStart) + action.wrap + selected + wrapEnd + value.slice(selectionEnd)
    }

    onApply(next)
    requestAnimationFrame(() => el.focus())
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 shadow-sm">
      {actions.map(({ key, icon: Icon, ...action }) => (
        <button
          key={key}
          type="button"
          onClick={() => apply(action)}
          aria-label={key}
          className="rounded-full p-1.5 text-[var(--text-soft)] hover:bg-[var(--bg-soft)] hover:text-[var(--text)]"
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  )
}
