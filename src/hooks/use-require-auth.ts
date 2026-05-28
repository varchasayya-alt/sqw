import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

/** Redirects to /login when there is no session; returns false until auth is verified. */
export function useRequireAuth() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/login" });
        return;
      }
      setReady(true);
    });
  }, [navigate]);

  return ready;
}
