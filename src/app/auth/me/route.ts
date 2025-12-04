'use server';

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;

  let response = null;

  if (data.user) {
    response = {
      user: {
        email: data.user.email,
      },
    };
  }

  return NextResponse.json(response);
}
