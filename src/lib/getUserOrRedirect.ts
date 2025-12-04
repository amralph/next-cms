'use server';

import { redirect } from 'next/navigation';
import { getUser } from './getUser';

export async function getUserOrRedirect(redirectUrl: string) {
  const user = await getUser();

  if (user) {
    return user;
  } else {
    redirect(redirectUrl);
  }
}
