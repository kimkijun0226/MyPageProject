import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks";
import supabase from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { supabaseGetSession } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const finish = () => {
      supabaseGetSession.mutate(undefined, {
        onSuccess: (user) => {
          if (!user) {
            toast.error("로그인 세션을 찾지 못했습니다.");
            navigate("/sign-in");
          }
        },
        onError: () => {
          toast.error("로그인 처리 중 오류가 발생했습니다.");
          navigate("/sign-in");
        },
      });
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        listener.subscription.unsubscribe();
        finish();
      }
    });

    // detectSessionInUrl이 URL의 code를 자동 교환함 — exchangeCodeForSession 중복 호출 금지
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        listener.subscription.unsubscribe();
        toast.error(error.message);
        navigate("/sign-in");
        return;
      }
      if (data.session) {
        listener.subscription.unsubscribe();
        finish();
      }
    });

    const timeout = window.setTimeout(() => {
      listener.subscription.unsubscribe();
      void supabase.auth.getSession().then(({ data }) => {
        if (!data.session) {
          toast.error("로그인 세션을 찾지 못했습니다.");
          navigate("/sign-in");
        }
      });
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
      listener.subscription.unsubscribe();
    };
  }, [navigate, supabaseGetSession]);

  return (
    <main className="flex h-full min-h-[720px] w-full items-center justify-center">
      <p>로그인을 진행 중입니다. 잠시만 기다려주세요.</p>
    </main>
  );
}
