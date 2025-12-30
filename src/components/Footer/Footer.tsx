import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        Built with <span className={styles.accent}>Adventure Engine</span> by <span className={styles.accent}>John Kappa</span> · © 2026 All rights reserved · <Link to="/terms" className={styles.link}>Terms</Link>
      </p>
    </footer>
  );
}

