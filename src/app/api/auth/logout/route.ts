import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.redirect(
    `${process.env.COGNITO_DOMAIN}/logout?client_id=${process.env.COGNITO_CLIENT_ID}&logout_uri=${process.env.COGNITO_LOGOUT_URI}`
  );

  // Clear local cookies
  response.cookies.set('id_token', '', { maxAge: 0, path: '/' });
  response.cookies.set('access_token', '', { maxAge: 0, path: '/' });

  return response;
}
