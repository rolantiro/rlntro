import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Compass, PenLine, Bookmark, User } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const itemClass = ({ isActive }) =>
  `flex flex-col items-center gap-1 text-[10px] ${isActive ? 'text-[var(--text)]' : 'text-[var(--text-soft)]'}`

export default function MobileNav() {
  const { currentUserId, getAuthor } = useApp()
  const me = getAuthor(currentUserId)

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2.5">
        <NavLink to="/" end className={itemClass}>
          <Home size={20} />
          Home
        </NavLink>
        <NavLink to="/explore" className={itemClass}>
          <Compass size={20} />
          Explore
        </NavLink>
        <NavLink to="/write" className={itemClass}>
          <PenLine size={20} />
          Write
        </NavLink>
        <NavLink to="/bookmarks" className={itemClass}>
          <Bookmark size={20} />
          Saved
        </NavLink>
        <NavLink to={`/profile/${me?.username}`} className={itemClass}>
          <User size={20} />
          Profile
        </NavLink>
      </div>
    </nav>
  )
}
