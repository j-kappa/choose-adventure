import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { FontSizeControl } from '../FontSizeControl';
import { FontFamilySelector } from '../FontFamilySelector';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.layout}>
      <div className={styles.controls}>
        <FontFamilySelector />
        <div className={styles.controlsDivider} />
        <FontSizeControl />
        <div className={styles.controlsDivider} />
        <ThemeToggle />
      </div>
      <Outlet />
    </div>
  );
}

