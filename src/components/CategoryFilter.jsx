import React from 'react'

export default function CategoryFilter({ options, value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-xs whitespace-nowrap transition-colors ${
            value === opt
              ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
              : 'border-[var(--border)] text-[var(--text-soft)] hover:border-[var(--text)]'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
