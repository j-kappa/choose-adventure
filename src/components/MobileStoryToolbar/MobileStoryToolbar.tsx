import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { FontSizeControl } from '../FontSizeControl';
import { FontFamilySelector } from '../FontFamilySelector';
import styles from './MobileStoryToolbar.module.css';

interface MobileStoryToolbarProps {
  canGoBack: boolean;
  onBack: () => void;
  onRestart: () => void;
}

export function MobileStoryToolbar({ canGoBack, onBack, onRestart }: MobileStoryToolbarProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.toolbar}>
      {/* Navigation controls */}
      <button
        onClick={() => navigate('/')}
        className={styles.navButton}
        title="Return to library"
        aria-label="Home"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </button>

      {canGoBack && (
        <button
          onClick={onBack}
          className={styles.navButton}
          title="Go back"
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      )}

      <button
        onClick={onRestart}
        className={styles.navButton}
        title="Restart story"
        aria-label="Restart"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M3 21v-5h5"/>
        </svg>
      </button>

      <div className={styles.divider} />

      {/* Font and theme controls */}
      <FontFamilySelector />
      <div className={styles.divider} />
      <FontSizeControl />
      <div className={styles.divider} />
      <ThemeToggle />
    </div>
  );
}

