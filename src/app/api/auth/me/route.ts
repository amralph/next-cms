import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/getUserSession';

export async function GET(request: NextRequest) {
  const idToken = request.cookies.get('id_token')?.value;
  if (!idToken) return NextResponse.json({ user: null });

  const user = await getUserSession();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      sub: user.sub,
      email: user.email,
      username: user['cognito:username'],
    },
  });
}
