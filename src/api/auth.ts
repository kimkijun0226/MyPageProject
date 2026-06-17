import { resolveAuthStoreUser } from "@/lib/authUser";
import supabase from "@/lib/supabase";

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  email: string;
  password: string;
  nickname?: string;
  profile_image?: string | File | null;
  service_agreed: boolean;
  privacy_agreed: boolean;
  marketing_agreed: boolean;
};

export type AuthUser = {
  id: string;
  email: string;
  isAdmin: boolean;
};

export type SignUpResult = {
  authUser: AuthUser;
  profile: {
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
};

async function signInWithPassword(payload: SignInPayload): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });
  if (error) throw error;
  const { user } = data;
  if (!user) throw new Error("로그인에 실패했습니다.");
  return resolveAuthStoreUser(user.id, (user.email ?? "") as string);
}

async function signUp(payload: SignUpPayload): Promise<SignUpResult> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
  });
  if (authError) throw authError;
  const { user } = authData;
  if (!user) throw new Error("회원 가입에 실패했습니다.");

  const { data: profile, error: insertError } = await supabase
    .from("user")
    .upsert(
      [
        {
          id: user.id,
          email: user.email ?? "",
          is_admin: false,
          ...(payload.nickname ? { nickname: payload.nickname } : {}),
          ...(payload.profile_image ? { profile_image: payload.profile_image } : {}),
          service_agreed: payload.service_agreed,
          privacy_agreed: payload.privacy_agreed,
          marketing_agreed: payload.marketing_agreed,
        },
      ],
      { onConflict: "id" },
    )
    .select()
    .single();

  if (insertError) throw insertError;

  return {
    authUser: {
      id: user.id,
      email: (user.email ?? "") as string,
      isAdmin: false,
    },
    profile: {
      id: profile.id,
      email: profile.email,
      nickname: profile.nickname ?? "",
      profile_image: profile.profile_image ?? null,
      is_admin: profile.is_admin ?? false,
      service_agreed: profile.service_agreed,
      privacy_agreed: profile.privacy_agreed,
      marketing_agreed: profile.marketing_agreed,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    },
  };
}

async function checkEmailDuplicate(email: string): Promise<boolean> {
  const { data, error } = await supabase.from("user").select("id").eq("email", email).maybeSingle();
  if (error) throw error;
  return data !== null;
}

function getAuthRedirectUrl() {
  // PKCE verifier는 현재 origin의 localStorage에 저장되므로 redirect도 같은 origin이어야 함
  const base = window.location.origin.replace(/\/$/, "");
  return `${base}/auth/callback`;
}

async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: { access_type: "offline", prompt: "consent" },
      redirectTo: getAuthRedirectUrl(),
    },
  });
  if (error) throw error;
}

async function supabaseGetSession(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const session = data.session;
  if (!session?.user) return null;

  return resolveAuthStoreUser(session.user.id, session.user.email ?? "");
}

export const authApi = {
  signInWithPassword,
  signUp,
  signInWithGoogle,
  supabaseGetSession,
  checkEmailDuplicate,
};
