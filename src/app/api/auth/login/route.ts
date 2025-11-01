import { NextResponse } from 'next/server';

export async function GET() {
  const url = new URL(`${process.env.COGNITO_DOMAIN!}/login`);
  url.searchParams.append('client_id', process.env.COGNITO_CLIENT_ID!);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', 'email openid phone');
  url.searchParams.append('redirect_uri', process.env.COGNITO_REDIRECT_URI!);

  return NextResponse.redirect(url.toString());
}
