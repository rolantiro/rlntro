import React from 'react'
import { Link } from 'react-router-dom'

export default function Tag({ children }) {
  return (
    <Link
      to={`/search?q=${encodeURIComponent(children)}`}
      className="text-xs text-[var(--text-soft)] hover:text-[var(--accent)]"
    >
      #{children}
    </Link>
  )
}
