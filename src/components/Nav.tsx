'use client';

import styles from './Nav.module.css';
import { useUser } from '@/providers/UserProvider';

export default function Nav() {
  const { user } = useUser();

  return (
    <nav className={styles.nav}>
      {!user && (
        <a href='/api/auth/login' className={styles.link}>
          Login
        </a>
      )}
      {user && (
        <div>
          <p className={styles.p}>Welcome {user.email}!</p>
          <a href='/api/auth/logout' className={styles.link}>
            Logout
          </a>
        </div>
      )}
    </nav>
  );
}
