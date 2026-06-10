-- topic 테이블: 관리자만 글 작성·수정·삭제 가능
-- user.is_admin = true 인 계정만 글 작성 가능 (20260609140000_user_is_admin.sql 참고)

-- is_admin() 함수는 20260609140000_user_is_admin.sql 에서 정의

drop policy if exists "Users can insert their own topics" on public.topic;
drop policy if exists "Users can update their own topics" on public.topic;
drop policy if exists "Users can delete their own topics" on public.topic;
drop policy if exists "topic_insert_authenticated" on public.topic;
drop policy if exists "topic_update_author" on public.topic;
drop policy if exists "topic_delete_author" on public.topic;
drop policy if exists "관리자만 글 작성" on public.topic;
drop policy if exists "관리자만 글 수정" on public.topic;
drop policy if exists "관리자만 글 삭제" on public.topic;

create policy "관리자만 글 작성"
  on public.topic for insert
  with check (public.is_admin() and auth.uid() = author);

create policy "관리자만 글 수정"
  on public.topic for update
  using (public.is_admin() and auth.uid() = author)
  with check (public.is_admin() and auth.uid() = author);

create policy "관리자만 글 삭제"
  on public.topic for delete
  using (public.is_admin() and auth.uid() = author);
