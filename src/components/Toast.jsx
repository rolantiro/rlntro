import React from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function Toast() {
  const { toast } = useApp()
  if (!toast) return null

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fadein">
      <div className="rounded-full bg-[var(--text)] px-5 py-2.5 text-sm text-[var(--bg)] shadow-lg">
        {toast}
      </div>
    </div>
  )
}
