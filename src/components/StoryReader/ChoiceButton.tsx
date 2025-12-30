import type { Choice } from '../../types/story';
import styles from './StoryReader.module.css';

interface ChoiceButtonProps {
  choice: Choice;
  index: number;
  onClick: () => void;
}

export function ChoiceButton({ choice, index, onClick }: ChoiceButtonProps) {
  return (
    <button
      className={styles.choiceButton}
      onClick={onClick}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <span className={styles.choiceNumber}>{index + 1}</span>
      <span className={styles.choiceText}>{choice.text}</span>
    </button>
  );
}

