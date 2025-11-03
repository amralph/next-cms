import styles from './page.module.css';
import Link from 'next/link';

export default async function Home() {
  return (
    <div className={styles.page}>
      <h1>Home</h1>
      <Link href={'/workspaces'}>Workspaces</Link>
    </div>
  );
}
