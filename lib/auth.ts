// SendGem - Auth Utilities
import { supabase } from './supabase';
import { cookies } from 'next/headers';

export type User = {
  id: string;
  email: string;
  name: string;
  company: string | null;
  plan: string;
  avatar_url: string | null;
};

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return {
    session,
    user: profile as User,
  };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile as User;
}

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    throw error;
  }

  return data;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}