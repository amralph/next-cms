'use client';

import React, { ReactNode } from 'react';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';

const cognitoAuthConfig: AuthProviderProps = {
  authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY as string,
  client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID as string,
  redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI as string,
  response_type: 'code',
  scope: 'email openid phone',
};

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <AuthProvider {...cognitoAuthConfig}>{children}</AuthProvider>;
}
