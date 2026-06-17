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

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          toast.error(error.message);
          navigate("/sign-in");
          return;
        }
        finish();
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        toast.error(error.message);
        navigate("/sign-in");
        return;
      }
      if (data.session) {
        finish();
        return;
      }

      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) {
          listener.subscription.unsubscribe();
          finish();
        }
      });

      window.setTimeout(() => {
        listener.subscription.unsubscribe();
        supabase.auth.getSession().then(({ data: retry }) => {
          if (!retry.session) {
            toast.error("로그인 세션을 찾지 못했습니다.");
            navigate("/sign-in");
          }
        });
      }, 4000);
    };

    void run();
  }, [navigate, supabaseGetSession]);

  return (
    <main className="flex h-full min-h-[720px] w-full items-center justify-center">
      <p>로그인을 진행 중입니다. 잠시만 기다려주세요.</p>
    </main>
  );
}
