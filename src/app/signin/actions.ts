'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signInWithEmail(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect('/signin');
}
