import { resolveAuthStoreUser } from "@/lib/authUser";
import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores";
import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { userApi } from "@/api";
import { queryKeys } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";

export default function useAuthListener() {
  const { setUser } = useAuthStore();
  const { supabaseGetSession } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      const session = await supabaseGetSession.mutateAsync();
      if (session) {
        setUser(session);
      }
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userId = session.user.id;
        void resolveAuthStoreUser(userId, session.user.email || "").then(setUser);
        queryClient.prefetchQuery({
          queryKey: queryKeys.user.info(userId).queryKey,
          queryFn: () => userApi.getUserInfo(userId),
        });
      } else {
        setUser(null);
        queryClient.removeQueries({ queryKey: queryKeys.user._def });
        queryClient.removeQueries({ queryKey: ["follow"] });
      }
    });

    return () => authListener?.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
