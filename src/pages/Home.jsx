import React, { useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import PostCard from '../components/PostCard.jsx'
import PoetryCard from '../components/PoetryCard.jsx'
import QuoteCard from '../components/QuoteCard.jsx'

function Section({ title, children }) {
  return (
    <section className="mb-14">
      <h2 className="font-display text-2xl mb-6">{title}</h2>
      {children}
    </section>
  )
}

export default function Home() {
  const { posts } = useApp()

  const stories = useMemo(() => posts.filter((p) => p.type === 'story'), [posts])
  const poems = useMemo(() => posts.filter((p) => p.type === 'poetry'), [posts])
  const quotes = useMemo(() => posts.filter((p) => p.type === 'quote'), [posts])
  const trending = useMemo(() => [...posts].sort((a, b) => b.likes - a.likes), [posts])
  const latest = useMemo(() => [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [posts])

  return (
    <main className="mx-auto max-w-5xl px-6 md:px-8 pt-10 pb-24">
      <Section title="For You">
        <div>{latest.slice(0, 3).map((p) => <PostCard key={p.id} post={p} />)}</div>
      </Section>

      <Section title="Trending">
        <div className="grid gap-8 md:grid-cols-3">
          {trending.slice(0, 3).map((p) => <PostCard key={p.id} post={p} variant="feature" />)}
        </div>
      </Section>

      <Section title="Latest Stories">
        <div>{latest.slice(0, 4).map((p) => <PostCard key={p.id} post={p} />)}</div>
      </Section>

      <Section title="Poetry">
        <div className="grid gap-6 md:grid-cols-2">
          {poems.slice(0, 4).map((p) => <PoetryCard key={p.id} post={p} />)}
        </div>
      </Section>

      <Section title="Short Stories">
        <div>{stories.map((p) => <PostCard key={p.id} post={p} />)}</div>
      </Section>

      <Section title="Quotes">
        <div className="grid gap-6 md:grid-cols-2">
          {quotes.map((p) => <QuoteCard key={p.id} post={p} />)}
        </div>
      </Section>
    </main>
  )
}
