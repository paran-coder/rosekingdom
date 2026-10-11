-- 접수함: 의뢰서(commission)와 로즈편지 구독(newsletter)을 한 표에 받습니다. 삭제 권한은 주지 않습니다.
create table if not exists public.inquiries (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null default 'commission' check (kind in ('commission','newsletter')),
  name       text not null,
  contact    text not null,                    -- 이메일(원문 그대로)
  message    text,
  extra      jsonb not null default '{}'::jsonb, -- 의뢰 종류·예산 등
  status     text not null default 'new' check (status in ('new','checked','done')),
  created_at timestamptz not null default now()
);
-- 같은 이메일이 구독을 여러 번 눌러도 한 줄만 남습니다
create unique index if not exists inquiries_newsletter_uniq on public.inquiries (lower(contact)) where kind = 'newsletter';
create index if not exists inquiries_kind_created on public.inquiries (kind, created_at desc);

alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;
grant select, insert, update on public.inquiries to service_role;
