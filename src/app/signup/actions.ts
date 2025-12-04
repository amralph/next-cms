'use server';

import { createClient } from '@/lib/supabase/server';

export async function signUpNewUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'https://example.com/welcome',
    },
  });

  if (error) throw error;
  return data;
}
