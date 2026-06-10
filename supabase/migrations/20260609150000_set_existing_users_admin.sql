-- 기존 가입 계정 전원 관리자로 설정 (이후 신규 가입은 is_admin = false 유지)
alter table public."user"
  add column if not exists is_admin boolean not null default false;

update public."user"
set is_admin = true
where is_admin = false;
