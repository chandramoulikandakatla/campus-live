import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  student_id: string;
  full_name: string;
  campus: string;
  wallet_balance: number;
}

interface AuthValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (studentId: string, pin: string) => Promise<void>;
  signUp: (studentId: string, pin: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

/** Student IDs are mapped to a stable internal email so the kiosk can use the ID + PIN pair. */
const emailFor = (studentId: string) => `${studentId.trim().toLowerCase()}@student.campuskart.app`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient]);

  const signIn = async (studentId: string, pin: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailFor(studentId),
      password: pin,
    });
    if (error) throw new Error('Student ID or PIN is incorrect.');
  };

  const signUp = async (studentId: string, pin: string, fullName: string) => {
    const normalizedId = studentId.trim().toUpperCase();
    const { data, error } = await supabase.auth.signUp({
      email: emailFor(studentId),
      password: pin,
      options: {
        data: { student_id: normalizedId, full_name: fullName.trim() || 'Student' },
      },
    });
    if (error) {
      throw new Error(
        error.message.toLowerCase().includes('already')
          ? 'That Student ID is already registered. Sign in instead.'
          : error.message,
      );
    }
    if (!data.session) throw new Error('Sign-up did not create a session. Please sign in with your Student ID and PIN.');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, student_id, full_name, campus, wallet_balance')
      .eq('id', user?.id ?? '')
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}
