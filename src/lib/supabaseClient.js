import { createClient } from '@supabase/supabase-js'

// These are PUBLIC-safe keys (not secrets) — meant to be embedded in frontend code.
// Real access control is enforced by Row Level Security policies in Supabase, not by hiding this key.
const SUPABASE_URL = 'https://jikmsjswycbdisxnqxiw.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_PnyzIazisSxBjO23drS5qQ_SV8XPrJT'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

export function normalizeProfile(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    bio: row.bio || '',
    avatar: row.avatar_url || `https://i.pravatar.cc/150?u=${row.id}`,
  }
}

export function normalizePost(row) {
  return {
    id: row.id,
    authorId: row.author_id,
    type: row.type,
    title: row.title,
    subtitle: row.subtitle || '',
    excerpt: (row.content || '').slice(0, 140),
    content: row.content,
    category: row.category,
    tags: row.tags || [],
    cover: row.cover || '',
    visibility: row.visibility,
    createdAt: row.created_at,
    likes: row.likes_count || 0,
    readingTime: row.reading_time || '',
    comments: (row.comments || [])
      .map((c) => ({ id: c.id, authorId: c.author_id, text: c.text, createdAt: c.created_at, _author: c.author }))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    _author: row.author,
  }
}
