'use server';

import { createClient } from '@/lib/supabase/server';

export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    return data.user;
  } else {
    return null;
  }
}
