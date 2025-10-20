'use client';

import React from 'react';
import { useAuth } from 'react-oidc-context';

export default function AuthClient() {
  const auth = useAuth();

  const signOutRedirect = (): void => {
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID as string;
    const logoutUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI as string;
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN as string;

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      logoutUri
    )}`;
  };

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Error: {auth.error.message}</div>;

  if (auth.isAuthenticated) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Welcome, {auth.user?.profile.email}</h2>

        <section>
          <pre>ID Token: {auth.user?.id_token}</pre>
          <pre>Access Token: {auth.user?.access_token}</pre>
          <pre>Refresh Token: {auth.user?.refresh_token}</pre>
        </section>

        <div style={{ marginTop: 20 }}>
          <button onClick={() => auth.removeUser()}>Sign Out (Local)</button>
          <button onClick={signOutRedirect} style={{ marginLeft: 10 }}>
            Sign Out (Cognito)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Sign In</h2>
      <button onClick={() => auth.signinRedirect()}>
        Sign In with Cognito
      </button>
    </div>
  );
}
