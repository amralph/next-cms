import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  // Exchange code for tokens
  const tokenRes = await fetch(`${process.env.COGNITO_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(
          `${process.env.COGNITO_CLIENT_ID}:${process.env.COGNITO_CLIENT_SECRET}`
        ).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.COGNITO_CLIENT_ID!,
      redirect_uri: process.env.COGNITO_REDIRECT_URI!,
      code,
    }),
  });

  const tokens = await tokenRes.json();

  // Save tokens (here: as cookies)
  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}`);
  response.cookies.set('id_token', tokens.id_token, {
    httpOnly: true,
    secure: true,
    path: '/',
  });
  response.cookies.set('access_token', tokens.access_token, {
    httpOnly: true,
    secure: true,
    path: '/',
  });

  return response;
}
