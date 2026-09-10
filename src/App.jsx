import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import MobileNav from './components/MobileNav.jsx'
import Toast from './components/Toast.jsx'
import Landing from './pages/Landing.jsx'
import Home from './pages/Home.jsx'
import Article from './pages/Article.jsx'
import Editor from './pages/Editor.jsx'
import Quotes from './pages/Quotes.jsx'
import Poetry from './pages/Poetry.jsx'
import Stories from './pages/Stories.jsx'
import Search from './pages/Search.jsx'
import Profile from './pages/Profile.jsx'
import Bookmarks from './pages/Bookmarks.jsx'

export default function App() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/explore" element={<Home />} />
        <Route path="/read/:id" element={<Article />} />
        <Route path="/write" element={<Editor />} />
        <Route path="/write/:draftId" element={<Editor />} />
        <Route path="/quotes" element={<Quotes />} />
        <Route path="/poetry" element={<Poetry />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/search" element={<Search />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/profile/:username" element={<Profile />} />
      </Routes>
      <MobileNav />
      <Toast />
    </div>
  )
}
