import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Bookmark, Sun, Moon, Feather } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const navLinkClass = ({ isActive }) =>
  `text-sm tracking-wide transition-colors hover:text-[var(--text)] ${
    isActive ? 'text-[var(--text)]' : 'text-[var(--text-soft)]'
  }`

export default function Navbar() {
  const { theme, toggleTheme, currentUserId, getAuthor } = useApp()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const me = getAuthor(currentUserId)

  function onSearchSubmit(e) {
    e.preventDefault()
    navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  }

  return (
    <header className="hidden md:block sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
        <Link to="/" className="font-display text-2xl tracking-wide">
          Ruang Kata
        </Link>

        <nav className="flex items-center gap-8">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/explore" className={navLinkClass}>Explore</NavLink>
          <NavLink to="/write" className={navLinkClass}>Write</NavLink>
          <NavLink to="/stories" className={navLinkClass}>Stories</NavLink>
          <NavLink to="/poetry" className={navLinkClass}>Poetry</NavLink>
          <NavLink to="/quotes" className={navLinkClass}>Quotes</NavLink>
        </nav>

        <div className="flex items-center gap-5">
          <form onSubmit={onSearchSubmit} className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5">
            <Search size={15} className="text-[var(--text-soft)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stories, poems..."
              className="w-36 bg-transparent text-sm outline-none placeholder:text-[var(--text-soft)]"
            />
          </form>

          <button onClick={toggleTheme} aria-label="Toggle dark mode" className="text-[var(--text-soft)] hover:text-[var(--text)]">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <Link to="/bookmarks" aria-label="Bookmarks" className="text-[var(--text-soft)] hover:text-[var(--text)]">
            <Bookmark size={18} />
          </Link>

          <Link to="/write" className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-[var(--text)] px-4 py-1.5 text-sm text-[var(--bg)] hover:opacity-90">
            <Feather size={14} /> Menulis
          </Link>

          <Link to={`/profile/${me?.username}`} className="h-8 w-8 overflow-hidden rounded-full border border-[var(--border)]">
            <img src={me?.avatar} alt={me?.name} className="h-full w-full object-cover" />
          </Link>
        </div>
      </div>
    </header>
  )
}
