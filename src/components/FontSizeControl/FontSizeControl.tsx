import { useFontSize } from '../../hooks/useFontSize';
import styles from './FontSizeControl.module.css';

export function FontSizeControl() {
  const { increase, decrease, canIncrease, canDecrease } = useFontSize();

  return (
    <div className={styles.control}>
      <button
        className={styles.button}
        onClick={decrease}
        disabled={!canDecrease}
        aria-label="Decrease font size"
        title="Decrease font size"
      >
        <span className={styles.icon}>A</span>
        <span className={styles.minus}>−</span>
      </button>
      
      <div className={styles.divider} />
      
      <button
        className={styles.button}
        onClick={increase}
        disabled={!canIncrease}
        aria-label="Increase font size"
        title="Increase font size"
      >
        <span className={styles.icon}>A</span>
        <span className={styles.plus}>+</span>
      </button>
    </div>
  );
}

