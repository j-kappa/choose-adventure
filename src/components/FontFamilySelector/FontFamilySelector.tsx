import { useState, useRef, useEffect } from 'react';
import { useFontFamily } from '../../hooks/useFontFamily';
import styles from './FontFamilySelector.module.css';

export function FontFamilySelector() {
  const { currentFont, setFont, fonts } = useFontFamily();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const serifFonts = fonts.filter(f => f.type === 'serif');
  const sansFonts = fonts.filter(f => f.type === 'sans');

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select font"
        aria-expanded={isOpen}
        title="Select font"
      >
        <span className={styles.triggerLabel} style={{ fontFamily: currentFont.family }}>
          Aa
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Serif</div>
            {serifFonts.map(font => (
              <button
                key={font.id}
                className={`${styles.option} ${currentFont.id === font.id ? styles.optionActive : ''}`}
                onClick={() => {
                  setFont(font.id);
                  setIsOpen(false);
                }}
                style={{ fontFamily: font.family }}
              >
                {font.name}
                {currentFont.id === font.id && (
                  <svg className={styles.check} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          
          <div className={styles.divider} />
          
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Sans-serif</div>
            {sansFonts.map(font => (
              <button
                key={font.id}
                className={`${styles.option} ${currentFont.id === font.id ? styles.optionActive : ''}`}
                onClick={() => {
                  setFont(font.id);
                  setIsOpen(false);
                }}
                style={{ fontFamily: font.family }}
              >
                {font.name}
                {currentFont.id === font.id && (
                  <svg className={styles.check} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

