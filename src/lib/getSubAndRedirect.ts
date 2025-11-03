import { redirect } from 'next/navigation';
import { getUserSession } from './getUserSession';

export async function getSubAndRedirect(redirectUrl: string) {
  const user = await getUserSession();
  if (!user) {
    redirect(redirectUrl);
  }
  const { sub } = user;
  return sub;
}
