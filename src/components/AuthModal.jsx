import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, signIn, signUp, showToast } = useApp()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!authModalOpen) return null

  function close() {
    setAuthModalOpen(false)
    setError('')
    setEmail('')
    setPassword('')
    setUsername('')
    setName('')
    setMode('login')
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) return
    if (mode === 'signup' && (!username.trim() || !name.trim())) {
      setError('Username dan nama wajib diisi.')
      return
    }

    setLoading(true)
    const err =
      mode === 'login'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, username.trim(), name.trim())
    setLoading(false)

    if (err) {
      setError(err.message || 'Terjadi kesalahan, coba lagi.')
      return
    }

    if (mode === 'signup') {
      showToast('Akun berhasil dibuat')
    } else {
      showToast('Berhasil masuk')
    }
    close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50">
      <div className="w-full md:max-w-sm max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-[var(--bg)] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-xl">{mode === 'login' ? 'Masuk' : 'Buat Akun'}</h3>
          <button onClick={close} className="text-[var(--text-soft)] hover:text-[var(--text)]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-[var(--text-soft)]">Nama</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-b border-[var(--border)] bg-transparent pb-2 text-sm outline-none focus:border-[var(--text)]"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-[var(--text-soft)]">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full border-b border-[var(--border)] bg-transparent pb-2 text-sm outline-none focus:border-[var(--text)]"
                  autoComplete="username"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-[var(--text-soft)]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-[var(--border)] bg-transparent pb-2 text-sm outline-none focus:border-[var(--text)]"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-[var(--text-soft)]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-[var(--border)] bg-transparent pb-2 text-sm outline-none focus:border-[var(--text)]"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="text-xs text-wine">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--text)] py-3 text-sm text-[var(--bg)] hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-[var(--text-soft)]">
          {mode === 'login' ? (
            <>
              Belum punya akun?{' '}
              <button onClick={() => { setMode('signup'); setError('') }} className="text-[var(--text)] underline">
                Daftar
              </button>
            </>
          ) : (
            <>
              Sudah punya akun?{' '}
              <button onClick={() => { setMode('login'); setError('') }} className="text-[var(--text)] underline">
                Masuk
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
