'use client';

import { signOut } from '@/app/signin/actions';
import { Button } from './Button';
import styles from './Nav.module.css';
import { useUser } from '@/providers/UserProvider';

export default function Nav() {
  const { user } = useUser();

  return (
    <nav className={styles.nav}>
      {!user && (
        <a href='/signin' className={styles.link}>
          Sign in
        </a>
      )}
      {!user && (
        <a href='/signup' className={styles.link}>
          Sign up
        </a>
      )}
      {user && (
        <div>
          <p className={styles.p}>Welcome {user.email}!</p>
          <Button className='text-black! border-black!' onClick={signOut}>
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}
