-- ============================================================
-- RUANG KATA — Supabase schema (auth + posts + interactions)
-- Jalankan seluruh file ini sekali di SQL Editor Supabase.
-- ============================================================

-- 1. PROFILES (1 baris per akun, terhubung ke auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  name text not null,
  bio text default '',
  avatar_url text default '',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile row saat user baru signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. POSTS
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('poetry','story','quote')),
  title text not null default 'Tanpa Judul',
  subtitle text default '',
  content text not null default '',
  cover text default '',
  category text default 'Personal',
  tags text[] default '{}',
  visibility text not null default 'public' check (visibility in ('public','unlisted','private')),
  reading_time text default '',
  likes_count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.posts enable row level security;

create policy "Public posts are readable by everyone"
  on public.posts for select
  using (visibility = 'public' or author_id = auth.uid());

create policy "Users can insert own posts"
  on public.posts for insert with check (auth.uid() = author_id);

create policy "Users can update own posts"
  on public.posts for update using (auth.uid() = author_id);

create policy "Users can delete own posts"
  on public.posts for delete using (auth.uid() = author_id);

-- 3. LIKES
create table public.likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

alter table public.likes enable row level security;

create policy "Likes are publicly readable"
  on public.likes for select using (true);

create policy "Users can like as themselves"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike their own like"
  on public.likes for delete using (auth.uid() = user_id);

create function public.handle_like_change()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_like_change
  after insert or delete on public.likes
  for each row execute procedure public.handle_like_change();

-- 4. BOOKMARKS
create table public.bookmarks (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

alter table public.bookmarks enable row level security;

create policy "Users can read own bookmarks"
  on public.bookmarks for select using (auth.uid() = user_id);

create policy "Users can bookmark as themselves"
  on public.bookmarks for insert with check (auth.uid() = user_id);

create policy "Users can remove own bookmark"
  on public.bookmarks for delete using (auth.uid() = user_id);

-- 5. FOLLOWS
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table public.follows enable row level security;

create policy "Follows are publicly readable"
  on public.follows for select using (true);

create policy "Users can follow as themselves"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow as themselves"
  on public.follows for delete using (auth.uid() = follower_id);

-- 6. COMMENTS
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);

alter table public.comments enable row level security;

create policy "Comments are publicly readable"
  on public.comments for select using (true);

create policy "Users can comment as themselves"
  on public.comments for insert with check (auth.uid() = author_id);

create policy "Users can delete own comment"
  on public.comments for delete using (auth.uid() = author_id);

-- 7. DRAFTS (privat, hanya pemilik yang bisa lihat)
create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text default '',
  content text default '',
  cover text default '',
  type text default 'story' check (type in ('poetry','story')),
  updated_at timestamptz default now()
);

alter table public.drafts enable row level security;

create policy "Users manage own drafts"
  on public.drafts for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

-- 8. Followers/following count helper (dihitung on-the-fly, tidak perlu kolom terpisah)
create view public.profile_stats as
select
  p.id,
  (select count(*) from public.follows f where f.following_id = p.id) as followers_count,
  (select count(*) from public.follows f where f.follower_id = p.id) as following_count,
  (select count(*) from public.posts po where po.author_id = p.id and po.visibility = 'public') as posts_count
from public.profiles p;
