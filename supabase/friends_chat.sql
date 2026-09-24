-- Chat 1-1, hanya antar user yang SALING follow (teman)
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);
create index messages_recipient_idx on public.messages (recipient_id, created_at desc);
create index messages_sender_idx on public.messages (sender_id, created_at desc);

alter table public.messages enable row level security;

create policy "Read own messages"
  on public.messages for select
  using (auth.uid() in (sender_id, recipient_id));

create policy "Send only to mutual follows"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (select 1 from public.follows f where f.follower_id = sender_id and f.following_id = recipient_id)
    and exists (select 1 from public.follows f where f.follower_id = recipient_id and f.following_id = sender_id)
  );

-- penerima hanya boleh menandai "sudah dibaca", tidak boleh mengubah isi pesan
create policy "Recipient marks as read"
  on public.messages for update
  using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);
revoke update on public.messages from anon, authenticated;
grant update (read_at) on public.messages to authenticated;

alter publication supabase_realtime add table public.messages;
