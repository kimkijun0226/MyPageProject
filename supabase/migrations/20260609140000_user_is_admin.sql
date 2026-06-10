-- user 테이블에 관리자 여부 필드 추가
alter table public."user"
  add column if not exists is_admin boolean not null default false;

-- 본인이 is_admin 값을 바꾸지 못하게 방지
create or replace function public.prevent_is_admin_self_update()
returns trigger
language plpgsql
as $$
begin
  if new.is_admin is distinct from old.is_admin and auth.uid() = old.id then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists user_prevent_is_admin_self_update on public."user";
create trigger user_prevent_is_admin_self_update
  before update on public."user"
  for each row
  execute function public.prevent_is_admin_self_update();

-- topic RLS: user.is_admin 기준으로 관리자 판별
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public."user"
    where id = auth.uid()
      and is_admin = true
  );
$$;
