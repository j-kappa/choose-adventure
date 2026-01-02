import { useState, useCallback } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import styles from './Admin.module.css';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ADMIN_PASSWORD) {
      setError('Admin access is not configured. Set VITE_ADMIN_PASSWORD environment variable.');
      return;
    }

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_authenticated', 'true');
      onLogin();
    } else {
      setError('Incorrect password');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  }, [password, onLogin]);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginIcon}>
          <Lock size={32} />
        </div>
        
        <h1 className={styles.loginTitle}>Admin Access</h1>
        <p className={styles.loginDescription}>
          Enter the admin password to access the story review dashboard.
        </p>
        
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={`${styles.inputGroup} ${isShaking ? styles.shake : ''}`}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter password"
              className={styles.passwordInput}
              autoFocus
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <button type="submit" className={styles.loginButton}>
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

