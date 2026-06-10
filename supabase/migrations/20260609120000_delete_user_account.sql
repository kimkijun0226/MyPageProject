-- 회원 탈퇴: 연관 데이터 일괄 삭제 (클라이언트에서 supabase.rpc('delete_user_account') 호출)
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  room_ids uuid[];
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select array_agg(id) into room_ids
  from dm_room
  where user1_id = uid or user2_id = uid;

  if room_ids is not null then
    delete from dm_message where room_id = any(room_ids);
    delete from dm_room where id = any(room_ids);
  end if;

  delete from notification where receiver_id = uid or sender_id = uid;
  delete from comment_like where user_id = uid;
  delete from topic_like where user_id = uid;
  delete from comment where author_id = uid;
  delete from topic where author = uid;
  delete from follow where follower_id = uid or following_id = uid;
  delete from "user" where id = uid;
end;
$$;

revoke all on function public.delete_user_account() from public;
grant execute on function public.delete_user_account() to authenticated;
