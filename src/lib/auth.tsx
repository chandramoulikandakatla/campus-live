import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface DemoUser {
  id: string;
  email: string;
  user_metadata: { student_id: string; full_name: string; campus: string };
}

export interface DemoSession {
  user: DemoUser;
}

export interface Profile {
  id: string;
  student_id: string;
  full_name: string;
  campus: string;
  wallet_balance: number;
}

interface AuthValue {
  session: DemoSession | null;
  user: DemoUser | null;
  loading: boolean;
  signIn: (studentId: string, pin: string) => Promise<void>;
  signUp: (studentId: string, pin: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const STORAGE_KEY = 'campuskart-demo-session';
const AuthContext = createContext<AuthValue | undefined>(undefined);

function readSession(): DemoSession | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) as DemoSession : null;
  } catch {
    return null;
  }
}

function createDemoSession(studentId: string, fullName = 'CampusKart Student'): DemoSession {
  const normalizedId = studentId.trim().toUpperCase();
  return {
    user: {
      id: `demo-${normalizedId.toLowerCase()}`,
      email: `${normalizedId.toLowerCase()}@demo.campuskart.local`,
      user_metadata: { student_id: normalizedId, full_name: fullName.trim() || 'CampusKart Student', campus: 'Delhi' },
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(readSession());
    setLoading(false);
  }, []);

  const signIn = async (studentId: string, pin: string) => {
    if (!studentId.trim() || !pin.trim()) throw new Error('Enter a demo Student ID and PIN.');
    const next = createDemoSession(studentId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  };

  const signUp = async (studentId: string, pin: string, fullName: string) => {
    if (!studentId.trim() || !pin.trim()) throw new Error('Enter a demo Student ID and PIN.');
    const next = createDemoSession(studentId, fullName);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  };

  const signOut = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  return <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
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
    queryFn: async (): Promise<Profile | null> => user ? ({
      id: user.id,
      student_id: user.user_metadata.student_id,
      full_name: user.user_metadata.full_name,
      campus: user.user_metadata.campus,
      wallet_balance: 2500,
    }) : null,
  });
}
