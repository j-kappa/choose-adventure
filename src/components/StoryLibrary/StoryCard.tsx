import { Link } from 'react-router-dom';
import type { StoryManifestEntry } from '../../types/story';
import styles from './StoryLibrary.module.css';

interface StoryCardProps {
  story: StoryManifestEntry;
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Link to={`/story/${story.id}`} className={styles.card}>
      <article className={styles.cardContent}>
        {story.cover && (
          <div className={styles.cardCover}>
            <img src={story.cover} alt="" loading="lazy" />
          </div>
        )}
        
        <div className={styles.cardBody}>
          <h2 className={styles.cardTitle}>{story.title}</h2>
          <p className={styles.cardAuthor}>by {story.author}</p>
          <p className={styles.cardDescription}>{story.description}</p>
        </div>
        
        <div className={styles.cardFooter}>
          <span className={styles.playButton}>
            Begin Story
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </article>
    </Link>
  );
}

