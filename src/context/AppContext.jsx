import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase, normalizeProfile, normalizePost } from '../lib/supabaseClient.js'
import { loadState, saveState, readingTime } from '../lib/storage.js'

const AppContext = createContext(null)

const POST_SELECT = '*, author:profiles!author_id(*), comments(*, author:profiles!author_id(*))'

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => loadState('theme', 'light'))
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authors, setAuthors] = useState([])
  const [authorsLoading, setAuthorsLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [drafts, setDrafts] = useState([])
  const [likes, setLikes] = useState({}) // postId -> true
  const [bookmarks, setBookmarks] = useState({}) // postId -> true
  const [follows, setFollows] = useState({}) // authorId -> true (yang saya ikuti)
  const [followedBy, setFollowedBy] = useState({}) // authorId -> true (yang mengikuti saya)
  const [messages, setMessages] = useState([]) // pesan saya, urut lama -> baru
  const [toast, setToast] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const currentUserId = session?.user?.id || null

  useEffect(() => saveState('theme', theme), [theme])
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

  const fetchAuthors = useCallback(async () => {
    const [{ data: profiles, error: e1 }, { data: stats, error: e2 }] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('profile_stats').select('*'),
    ])
    if (e1) { console.error(e1); setAuthorsLoading(false); return }
    const statsById = Object.fromEntries((stats || []).map((s) => [s.id, s]))
    setAuthors(
      (profiles || []).map((p) => ({
        ...normalizeProfile(p),
        followers: statsById[p.id]?.followers_count || 0,
        following: statsById[p.id]?.following_count || 0,
      }))
    )
    if (e2) console.error(e2)
    setAuthorsLoading(false)
  }, [])

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .order('created_at', { ascending: false })
    if (error) { console.error(error); setPostsLoading(false); return }
    setPosts((data || []).map(normalizePost))
    setPostsLoading(false)
  }, [])

  const fetchMine = useCallback(async (uid) => {
    if (!uid) {
      setLikes({})
      setBookmarks({})
      setFollows({})
      setFollowedBy({})
      setMessages([])
      setDrafts([])
      return
    }
    const [{ data: likeRows }, { data: bmRows }, { data: followRows }, { data: draftRows }, { data: fbRows }, { data: msgRows }] = await Promise.all([
      supabase.from('likes').select('post_id').eq('user_id', uid),
      supabase.from('bookmarks').select('post_id').eq('user_id', uid),
      supabase.from('follows').select('following_id').eq('follower_id', uid),
      supabase.from('drafts').select('*').eq('author_id', uid).order('updated_at', { ascending: false }),
      supabase.from('follows').select('follower_id').eq('following_id', uid),
      supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(500),
    ])
    setLikes(Object.fromEntries((likeRows || []).map((r) => [r.post_id, true])))
    setBookmarks(Object.fromEntries((bmRows || []).map((r) => [r.post_id, true])))
    setFollows(Object.fromEntries((followRows || []).map((r) => [r.following_id, true])))
    setFollowedBy(Object.fromEntries((fbRows || []).map((r) => [r.follower_id, true])))
    setMessages((msgRows || []).reverse())
    setDrafts(
      (draftRows || []).map((d) => ({
        id: d.id,
        title: d.title,
        content: d.content,
        cover: d.cover,
        type: d.type,
        updatedAt: d.updated_at,
      }))
    )
  }, [])

  useEffect(() => {
    fetchAuthors()
    fetchPosts()

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      fetchMine(s?.user?.id)
      setAuthLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      fetchMine(s?.user?.id)
      if (s?.user?.id) fetchAuthors() // pick up newly-created profile row after signup
    })

    return () => sub.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const requireAuth = useCallback(() => {
    if (!currentUserId) {
      setAuthModalOpen(true)
      return false
    }
    return true
  }, [currentUserId])

  const toggleLike = useCallback(
    async (postId) => {
      if (!requireAuth()) return
      const wasLiked = !!likes[postId]
      setLikes((prev) => ({ ...prev, [postId]: !wasLiked }))
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + (wasLiked ? -1 : 1) } : p)))

      const { error } = wasLiked
        ? await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', currentUserId)
        : await supabase.from('likes').insert({ post_id: postId, user_id: currentUserId })

      if (error) {
        setLikes((prev) => ({ ...prev, [postId]: wasLiked }))
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + (wasLiked ? 1 : -1) } : p)))
        showToast('Gagal menyimpan like')
      }
    },
    [likes, currentUserId, requireAuth, showToast]
  )

  const toggleBookmark = useCallback(
    async (postId) => {
      if (!requireAuth()) return
      const wasBookmarked = !!bookmarks[postId]
      setBookmarks((prev) => ({ ...prev, [postId]: !wasBookmarked }))
      showToast(wasBookmarked ? 'Dihapus dari bookmark' : 'Disimpan ke bookmark')

      const { error } = wasBookmarked
        ? await supabase.from('bookmarks').delete().eq('post_id', postId).eq('user_id', currentUserId)
        : await supabase.from('bookmarks').insert({ post_id: postId, user_id: currentUserId })

      if (error) {
        setBookmarks((prev) => ({ ...prev, [postId]: wasBookmarked }))
        showToast('Gagal menyimpan bookmark')
      }
    },
    [bookmarks, currentUserId, requireAuth, showToast]
  )

  const toggleFollow = useCallback(
    async (authorId) => {
      if (!requireAuth()) return
      const wasFollowing = !!follows[authorId]
      setFollows((prev) => ({ ...prev, [authorId]: !wasFollowing }))

      const { error } = wasFollowing
        ? await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', authorId)
        : await supabase.from('follows').insert({ follower_id: currentUserId, following_id: authorId })

      if (error) {
        setFollows((prev) => ({ ...prev, [authorId]: wasFollowing }))
        showToast('Gagal mengikuti')
      } else {
        fetchAuthors() // refresh follower/following counts
      }
    },
    [follows, currentUserId, requireAuth, showToast, fetchAuthors]
  )

  const addComment = useCallback(
    async (postId, text) => {
      if (!requireAuth()) return
      const { data, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, author_id: currentUserId, text })
        .select('*, author:profiles!author_id(*)')
        .single()

      if (error || !data) {
        showToast('Gagal mengirim komentar')
        return
      }

      const comment = {
        id: data.id,
        authorId: data.author_id,
        text: data.text,
        createdAt: data.created_at,
        _author: data.author,
      }
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)))
    },
    [currentUserId, requireAuth, showToast]
  )

  const saveDraft = useCallback(
    async (draft) => {
      if (!requireAuth()) return null
      const payload = {
        author_id: currentUserId,
        title: draft.title || '',
        content: draft.content || '',
        cover: draft.cover || '',
        type: draft.type || 'story',
        updated_at: new Date().toISOString(),
      }

      if (draft.id) {
        const { error } = await supabase.from('drafts').update(payload).eq('id', draft.id).eq('author_id', currentUserId)
        if (error) {
          showToast('Gagal menyimpan draft')
          return draft.id
        }
        setDrafts((prev) => prev.map((d) => (d.id === draft.id ? { ...d, ...draft, updatedAt: payload.updated_at } : d)))
        return draft.id
      }

      const { data, error } = await supabase.from('drafts').insert(payload).select().single()
      if (error || !data) {
        showToast('Gagal menyimpan draft')
        return null
      }
      setDrafts((prev) => [
        { id: data.id, title: data.title, content: data.content, cover: data.cover, type: data.type, updatedAt: data.updated_at },
        ...prev,
      ])
      return data.id
    },
    [currentUserId, requireAuth, showToast]
  )

  const deleteDraft = useCallback(
    async (draftId) => {
      setDrafts((prev) => prev.filter((d) => d.id !== draftId))
      const { error } = await supabase.from('drafts').delete().eq('id', draftId).eq('author_id', currentUserId)
      if (error) {
        showToast('Gagal menghapus draft')
        fetchMine(currentUserId)
      }
    },
    [currentUserId, showToast, fetchMine]
  )

  const publishPost = useCallback(
    async (draft) => {
      if (!requireAuth()) return null
      const payload = {
        author_id: currentUserId,
        type: draft.type || 'story',
        title: draft.title || 'Tanpa Judul',
        subtitle: draft.subtitle || '',
        content: draft.content || '',
        cover: draft.cover || '',
        category: draft.category || 'Personal',
        tags: draft.tags || [],
        visibility: draft.visibility || 'public',
        reading_time: readingTime(draft.content || ''),
      }

      const { data, error } = await supabase.from('posts').insert(payload).select(POST_SELECT).single()
      if (error || !data) {
        console.error('publish error', error)
        showToast('Gagal mempublikasikan')
        return null
      }

      const post = normalizePost(data)
      setPosts((prev) => [post, ...prev])
      if (draft.id) deleteDraft(draft.id)
      showToast('Tulisan berhasil dipublikasikan')
      return post
    },
    [currentUserId, requireAuth, showToast, deleteDraft]
  )

  const refreshFollowers = useCallback(async () => {
    if (!currentUserId) return
    const { data } = await supabase.from('follows').select('follower_id').eq('following_id', currentUserId)
    setFollowedBy(Object.fromEntries((data || []).map((r) => [r.follower_id, true])))
  }, [currentUserId])

  // pesan masuk realtime
  useEffect(() => {
    if (!currentUserId) return
    const ch = supabase
      .channel(`msgs-${currentUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${currentUserId}` },
        (payload) => setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]))
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [currentUserId])

  const sendMessage = useCallback(
    async (recipientId, text) => {
      if (!requireAuth()) return false
      const body = text.trim()
      if (!body) return false
      const { data, error } = await supabase
        .from('messages')
        .insert({ sender_id: currentUserId, recipient_id: recipientId, text: body })
        .select()
        .single()
      if (error || !data) {
        console.error('send error', error)
        showToast('Gagal mengirim. Pastikan kalian saling follow.')
        return false
      }
      setMessages((prev) => [...prev, data])
      return true
    },
    [currentUserId, requireAuth, showToast]
  )

  const markRead = useCallback(
    async (peerId) => {
      if (!currentUserId) return
      const unread = messages.some((m) => m.sender_id === peerId && m.recipient_id === currentUserId && !m.read_at)
      if (!unread) return
      const now = new Date().toISOString()
      setMessages((prev) => prev.map((m) => (m.sender_id === peerId && m.recipient_id === currentUserId && !m.read_at ? { ...m, read_at: now } : m)))
      await supabase.from('messages').update({ read_at: now }).eq('sender_id', peerId).eq('recipient_id', currentUserId).is('read_at', null)
    },
    [currentUserId, messages]
  )

  const unreadCount = useMemo(
    () => messages.filter((m) => m.recipient_id === currentUserId && !m.read_at).length,
    [messages, currentUserId]
  )

  const getAuthor = useCallback((id) => authors.find((a) => a.id === id), [authors])

  const updateMe = useCallback(
    async (patch) => {
      if (!currentUserId) return
      const payload = {}
      if (patch.name !== undefined) payload.name = patch.name
      if (patch.bio !== undefined) payload.bio = patch.bio
      if (patch.avatar !== undefined) payload.avatar_url = patch.avatar

      const { error } = await supabase.from('profiles').update(payload).eq('id', currentUserId)
      if (error) {
        showToast('Gagal menyimpan profil')
        return
      }
      setAuthors((prev) => prev.map((a) => (a.id === currentUserId ? { ...a, ...patch } : a)))
      showToast('Profil diperbarui')
    },
    [currentUserId, showToast]
  )

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }, [])

  const signUp = useCallback(async (email, password, username, name) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, name } },
    })
    return error
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    showToast('Berhasil keluar')
  }, [showToast])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      authors,
      authorsLoading,
      posts,
      postsLoading,
      drafts,
      likes,
      bookmarks,
      follows,
      followedBy,
      messages,
      unreadCount,
      refreshFollowers,
      sendMessage,
      markRead,
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
      currentUserId,
      session,
      authLoading,
      authModalOpen,
      setAuthModalOpen,
      signIn,
      signUp,
      signOut,
    }),
    [
      theme, toggleTheme, authors, authorsLoading, posts, postsLoading, drafts, likes, bookmarks, follows, followedBy, messages, unreadCount, refreshFollowers, sendMessage, markRead, toast, showToast,
      toggleLike, toggleBookmark, toggleFollow, addComment, saveDraft, deleteDraft, publishPost, getAuthor, updateMe,
      currentUserId, session, authLoading, authModalOpen, signIn, signUp, signOut,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
