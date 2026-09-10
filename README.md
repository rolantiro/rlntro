# Ruang Kata

Aplikasi web editorial untuk menulis dan membaca puisi, cerita pendek, dan quotes — dibangun dengan React + Vite + Tailwind. Semua data (post, like, bookmark, follow, draft) disimpan di `localStorage` browser, jadi bisa langsung dicoba tanpa backend.

## Fitur

- Landing, Home/Discover (For You, Trending, Latest, Poetry, Stories, Quotes), halaman baca, halaman Poetry/Stories/Quotes/Search/Profile/Bookmarks
- Editor menulis dengan **Poetry Mode**, floating formatting toolbar, autosave draft, preview, publish modal (kategori/tag/visibility)
- Like, bookmark, comment, follow — tersimpan di `localStorage`
- Light/Dark mode (dark mode dirancang sebagai reading mode, bukan sekadar invert warna)
- **Share to Instagram**: generator gambar puisi (Story 1080×1920, Portrait 1080×1350, Square 1080×1080), 5 template (Minimal/Dark/Paper/Editorial/Photo), live preview, auto text-fit dengan pagination/carousel untuk puisi panjang, export JPG via `<canvas>`, Web Share API di perangkat yang mendukung
- Bottom navigation + floating write action di mobile

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

Build produksi:

```bash
npm run build
npm run preview
```

## Struktur proyek

```
src/
  components/   komponen reusable (Navbar, PostCard, QuoteCard, LikeButton, dst.)
  pages/        halaman (Landing, Home, Article, Editor, Quotes, Poetry, Stories, Search, Profile, Bookmarks)
  context/      AppContext.jsx — state global (posts, auth "user" lokal, tema, interaksi)
  data/seed.js  data contoh (author + post) agar app tidak kosong saat pertama dibuka
  lib/storage.js  helper localStorage + utilitas kecil (reading time, format tanggal)
```

## Upload ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: Ruang Kata"
git branch -M main
git remote add origin https://github.com/<username>/<nama-repo>.git
git push -u origin main
```

## Catatan pengembangan lanjutan

Saat ini semua data tersimpan lokal di browser (tanpa backend/autentikasi sungguhan) → ganti `AppContext.jsx` dan `lib/storage.js` dengan panggilan API/database (mis. Supabase/Postgres) begitu butuh multi-device atau multi-user sungguhan. Struktur data `Post`/`User` sudah mengikuti skema di brief sehingga migrasi ke backend cukup mengganti layer penyimpanan, bukan mendesain ulang UI.
