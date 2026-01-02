import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { StoryReview } from './StoryReview';
import styles from './Admin.module.css';

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('admin_authenticated');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  }, []);

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={18} />
            Back to Library
          </Link>
          <h1 className={styles.title}>Story Review Dashboard</h1>
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </header>
      
      <main className={styles.main}>
        <StoryReview />
      </main>
    </div>
  );
}

