import React from 'react'
import { useApp } from '../context/AppContext.jsx'
import PostCard from '../components/PostCard.jsx'

export default function Stories() {
  const { posts } = useApp()
  const stories = posts.filter((p) => p.type === 'story')

  return (
    <main className="mx-auto max-w-5xl px-6 md:px-8 pt-10 pb-24">
      <h1 className="font-display text-3xl mb-8">Stories</h1>
      <div className="grid gap-x-10 md:grid-cols-2">
        {stories.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </main>
  )
}
