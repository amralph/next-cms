import styles from './page.module.css';
import AuthClient from '../components/AuthClient';

export default function Home() {
  return (
    <div className={styles.page}>
      <AuthClient></AuthClient>
    </div>
  );
}
