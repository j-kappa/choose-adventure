import type { Passage as PassageType } from '../../types/story';
import styles from './StoryReader.module.css';

interface PassageProps {
  passage: PassageType;
  passageKey: string;
}

export function Passage({ passage, passageKey }: PassageProps) {
  // Split text by double newlines to create paragraphs
  const paragraphs = passage.text.split(/\n\n+/).filter(p => p.trim());

  return (
    <div className={styles.passage} key={passageKey}>
      {paragraphs.map((paragraph, index) => (
        <p 
          key={index} 
          className={styles.paragraph}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

