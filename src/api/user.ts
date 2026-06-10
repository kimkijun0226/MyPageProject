import supabase from "@/lib/supabase";

export type UserInfo = {
  id: string;
  email: string;
  nickname: string;
  profile_image: string | null;
  is_admin: boolean;
  service_agreed: boolean;
  privacy_agreed: boolean;
  marketing_agreed: boolean;
  created_at?: string;
  updated_at?: string;
};

const getUserInfo = async (id: string): Promise<UserInfo | null> => {
  const withAdmin = await supabase
    .from("user")
    .select("id, nickname, profile_image, email, is_admin")
    .eq("id", id)
    .maybeSingle();

  if (!withAdmin.error && withAdmin.data) {
    return { ...withAdmin.data, is_admin: withAdmin.data.is_admin ?? false } as UserInfo;
  }

  const { data, error } = await supabase
    .from("user")
    .select("id, nickname, profile_image, email")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { ...data, is_admin: false } as UserInfo;
};

/** 로그인 세션 기준 본인 관리자 여부 */
const getMyIsAdmin = async (): Promise<boolean> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return false;

  const { data, error } = await supabase
    .from("user")
    .select("is_admin")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) return false;
  return Boolean(data?.is_admin);
};

const searchUsers = async (query: string, excludeId: string): Promise<UserInfo[]> => {
  const pattern = `%${query.trim()}%`;
  const select = "id, nickname, profile_image, email";

  const [byNickname, byEmail] = await Promise.all([
    supabase.from("user").select(select).ilike("nickname", pattern).neq("id", excludeId).limit(10),
    supabase.from("user").select(select).ilike("email", pattern).neq("id", excludeId).limit(10),
  ]);

  if (byNickname.error) throw byNickname.error;
  if (byEmail.error) throw byEmail.error;

  const merged = new Map<string, UserInfo>();
  for (const row of [...(byNickname.data ?? []), ...(byEmail.data ?? [])]) {
    merged.set(row.id, { ...(row as UserInfo), is_admin: false });
  }
  return Array.from(merged.values()).slice(0, 10);
};

const updateUserInfo = async (
  id: string,
  data: { nickname?: string; profile_image?: string | null },
): Promise<UserInfo> => {
  const { data: updated, error } = await supabase.from("user").update(data).eq("id", id).select().single();
  if (error) throw error;
  return updated as UserInfo;
};

const throwIfError = (error: { message: string } | null) => {
  if (error) throw error;
};

/** DB에 delete_user_account RPC가 있으면 우선 사용 */
const deleteUserAccountViaRpc = async (): Promise<boolean> => {
  const { error } = await supabase.rpc("delete_user_account");
  if (!error) return true;
  if (error.code === "PGRST202" || error.message.includes("delete_user_account")) return false;
  throw error;
};

const deleteUserAccountViaClient = async (id: string): Promise<void> => {
  const { data: rooms, error: roomsError } = await supabase
    .from("dm_room")
    .select("id")
    .or(`user1_id.eq.${id},user2_id.eq.${id}`);
  throwIfError(roomsError);

  const roomIds = (rooms ?? []).map((room) => room.id as string);
  if (roomIds.length > 0) {
    throwIfError((await supabase.from("dm_message").delete().in("room_id", roomIds)).error);
    throwIfError((await supabase.from("dm_room").delete().in("id", roomIds)).error);
  }

  throwIfError(
    (await supabase.from("notification").delete().or(`receiver_id.eq.${id},sender_id.eq.${id}`)).error,
  );
  throwIfError((await supabase.from("comment_like").delete().eq("user_id", id)).error);
  throwIfError((await supabase.from("topic_like").delete().eq("user_id", id)).error);
  throwIfError((await supabase.from("comment").delete().eq("author_id", id)).error);
  throwIfError((await supabase.from("topic").delete().eq("author", id)).error);
  throwIfError(
    (await supabase.from("follow").delete().or(`follower_id.eq.${id},following_id.eq.${id}`)).error,
  );
  throwIfError((await supabase.from("user").delete().eq("id", id)).error);
};

const deleteUserAccount = async (id: string): Promise<void> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user || session.user.id !== id) {
    throw new Error("로그인 세션이 유효하지 않습니다.");
  }

  const deletedByRpc = await deleteUserAccountViaRpc();
  if (!deletedByRpc) {
    await deleteUserAccountViaClient(id);
  }
};

export const userApi = {
  getUserInfo,
  getMyIsAdmin,
  searchUsers,
  updateUserInfo,
  deleteUserAccount,
};
