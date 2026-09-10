import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { loadState, saveState, uid, readingTime } from '../lib/storage.js'
import { seedAuthors, seedPosts } from '../data/seed.js'

const AppContext = createContext(null)

const CURRENT_USER_ID = 'u_me'
const meSeed = {
  id: CURRENT_USER_ID,
  name: 'Kamu',
  username: 'kamu',
  bio: 'Menulis sedikit demi sedikit, setiap hari.',
  avatar: 'https://i.pravatar.cc/150?img=68',
  followers: 12,
  following: 6,
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => loadState('theme', 'light'))
  const [authors, setAuthors] = useState(() => loadState('authors', [...seedAuthors, meSeed]))
  const [posts, setPosts] = useState(() => loadState('posts', seedPosts))
  const [drafts, setDrafts] = useState(() => loadState('drafts', []))
  const [likes, setLikes] = useState(() => loadState('likes', {})) // postId -> true
  const [bookmarks, setBookmarks] = useState(() => loadState('bookmarks', {}))
  const [follows, setFollows] = useState(() => loadState('follows', {})) // authorId -> true
  const [toast, setToast] = useState(null)

  useEffect(() => saveState('theme', theme), [theme])
  useEffect(() => saveState('authors', authors), [authors])
  useEffect(() => saveState('posts', posts), [posts])
  useEffect(() => saveState('drafts', drafts), [drafts])
  useEffect(() => saveState('likes', likes), [likes])
  useEffect(() => saveState('bookmarks', bookmarks), [bookmarks])
  useEffect(() => saveState('follows', follows), [follows])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const showToast = useCallback((message) => {
    setToast(message)
    window.clearTimeout(showToast._t)
    showToast._t = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }, [])

  const toggleLike = useCallback(
    (postId) => {
      setLikes((prev) => {
        const next = { ...prev, [postId]: !prev[postId] }
        return next
      })
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + (likes[postId] ? -1 : 1) } : p))
      )
    },
    [likes]
  )

  const toggleBookmark = useCallback((postId) => {
    setBookmarks((prev) => {
      const isNowOn = !prev[postId]
      showToast(isNowOn ? 'Disimpan ke bookmark' : 'Dihapus dari bookmark')
      return { ...prev, [postId]: isNowOn }
    })
  }, [showToast])

  const toggleFollow = useCallback((authorId) => {
    setFollows((prev) => ({ ...prev, [authorId]: !prev[authorId] }))
  }, [])

  const addComment = useCallback((postId, text) => {
    const comment = { id: uid('c'), authorId: CURRENT_USER_ID, text, createdAt: new Date().toISOString() }
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)))
  }, [])

  const saveDraft = useCallback((draft) => {
    setDrafts((prev) => {
      const existingIdx = prev.findIndex((d) => d.id === draft.id)
      if (existingIdx >= 0) {
        const next = [...prev]
        next[existingIdx] = { ...draft, updatedAt: new Date().toISOString() }
        return next
      }
      return [...prev, { ...draft, id: draft.id || uid('draft'), updatedAt: new Date().toISOString() }]
    })
  }, [])

  const deleteDraft = useCallback((draftId) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId))
  }, [])

  const publishPost = useCallback(
    (draft) => {
      const post = {
        id: uid('p'),
        authorId: CURRENT_USER_ID,
        type: draft.type || 'story',
        title: draft.title || 'Tanpa Judul',
        subtitle: draft.subtitle || '',
        excerpt: (draft.content || '').slice(0, 140),
        content: draft.content || '',
        category: draft.category || 'Personal',
        tags: draft.tags || [],
        cover: draft.cover || '',
        visibility: draft.visibility || 'public',
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: [],
        readingTime: readingTime(draft.content || ''),
      }
      setPosts((prev) => [post, ...prev])
      if (draft.id) deleteDraft(draft.id)
      showToast('Tulisan berhasil dipublikasikan')
      return post
    },
    [deleteDraft, showToast]
  )

  const getAuthor = useCallback((id) => authors.find((a) => a.id === id), [authors])

  const updateMe = useCallback((patch) => {
    setAuthors((prev) => prev.map((a) => (a.id === CURRENT_USER_ID ? { ...a, ...patch } : a)))
  }, [])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      authors,
      posts,
      drafts,
      likes,
      bookmarks,
      follows,
      toast,
      showToast,
      toggleLike,
      toggleBookmark,
      toggleFollow,
      addComment,
      saveDraft,
      deleteDraft,
      publishPost,
      getAuthor,
      updateMe,
      currentUserId: CURRENT_USER_ID,
    }),
    [
      theme, toggleTheme, authors, posts, drafts, likes, bookmarks, follows, toast, showToast,
      toggleLike, toggleBookmark, toggleFollow, addComment, saveDraft, deleteDraft, publishPost, getAuthor, updateMe,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
