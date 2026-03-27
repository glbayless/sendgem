'use client';

// SendGem - Auth Provider
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  company: string | null;
  plan: string;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        // Redirect to login if on protected route
        if (pathname?.startsWith('/dashboard')) {
          router.push('/login');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (supabaseUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        setUser(profile as User);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.session) {
      router.push('/dashboard');
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) throw error;

    if (data.session) {
      router.push('/dashboard');
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}