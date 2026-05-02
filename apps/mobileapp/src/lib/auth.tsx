import type { Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { hasSupabaseConfig, supabase } from "./supabase";

interface AuthContextValue {
  hasSupabaseConfig: boolean;
  isLoading: boolean;
  session: Session | null;
  displayName: string;
  sendMagicLink: (email: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      hasSupabaseConfig,
      isLoading,
      session,
      displayName: readDisplayName(session),
      async sendMagicLink(email: string) {
        if (!supabase) {
          throw new Error("Add Supabase environment variables before signing in.");
        }

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: "vicina://auth"
          }
        });

        if (error) {
          throw error;
        }
      },
      async signInWithPassword(email: string, password: string) {
        if (!supabase) {
          throw new Error("Add Supabase environment variables before signing in.");
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          throw error;
        }
      },
      async signUpWithPassword(email: string, password: string, nextDisplayName: string) {
        if (!supabase) {
          throw new Error("Add Supabase environment variables before signing in.");
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: nextDisplayName
            }
          }
        });

        if (error) {
          throw error;
        }
      },
      async signOut() {
        if (!supabase) {
          return;
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
      }
    }),
    [isLoading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}

function readDisplayName(session: Session | null): string {
  const rawName = session?.user.user_metadata.display_name;
  if (typeof rawName === "string" && rawName.trim()) {
    return rawName.trim();
  }

  return session?.user.email?.split("@")[0] ?? "Neighbor";
}
