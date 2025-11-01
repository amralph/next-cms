import { cookies } from 'next/headers';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'id', // or "access" if you prefer to verify access tokens
  clientId: process.env.COGNITO_CLIENT_ID!,
});

export async function getUserSession() {
  const token = (await cookies()).get('id_token')?.value;

  if (!token) return null;

  try {
    const payload = await verifier.verify(token);
    return payload; // contains sub, email, name, etc.
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
