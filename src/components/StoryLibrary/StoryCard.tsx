import { Link } from 'react-router-dom';
import { Smile } from 'lucide-react';
import type { StoryManifestEntry } from '../../types/story';
import styles from './StoryLibrary.module.css';

interface StoryCardProps {
  story: StoryManifestEntry;
  index?: number;
}

export function StoryCard({ story, index = 0 }: StoryCardProps) {
  return (
    <Link 
      to={`/story/${story.id}`} 
      className={styles.card}
      style={{ '--animation-order': index } as React.CSSProperties}
    >
      <article className={styles.cardContent}>
        {story.cover && (
          <div className={styles.cardCover}>
            <img src={story.cover} alt="" loading="lazy" />
          </div>
        )}
        
        <div className={styles.cardBody}>
          <div className={styles.cardTitleRow}>
            <h2 className={styles.cardTitle}>{story.title}</h2>
            {story.childFriendly && (
              <span className={styles.childFriendlyBadge}>
                <Smile size={16} />
                <span className={styles.childFriendlyTooltip}>Child Friendly</span>
              </span>
            )}
          </div>
          <p className={styles.cardAuthor}>by {story.author}</p>
          <p className={styles.cardDescription}>{story.description}</p>
          {story.tags && story.tags.length > 0 && (
            <div className={styles.cardTags}>
              {story.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
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

