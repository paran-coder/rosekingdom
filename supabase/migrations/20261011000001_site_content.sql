-- 사이트 내용(글자·목록). 브라우저 키(anon)로는 읽고 쓸 수 없고, 서버 함수(service_role)만 접근합니다.
create table if not exists public.site_content (
  key        text primary key,                 -- 'sns.rose', 'screenings', 'lab', 'letters'
  type       text not null default 'text'
    check (type in ('text','longtext','list','toggle')),
  label      text not null,                    -- 어드민에 보일 이름
  value      jsonb not null,
  sort       integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
revoke all on public.site_content from anon, authenticated;
grant select, insert, update on public.site_content to service_role;
