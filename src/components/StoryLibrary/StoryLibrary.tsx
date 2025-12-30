import { useEffect, useState } from 'react';
import type { StoryManifestEntry } from '../../types/story';
import { getAvailableStories } from '../../utils/storyLoader';
import { StoryCard } from './StoryCard';
import styles from './StoryLibrary.module.css';

export function StoryLibrary() {
  const [stories, setStories] = useState<StoryManifestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStories() {
      try {
        const available = await getAvailableStories();
        setStories(available);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stories');
      } finally {
        setLoading(false);
      }
    }

    loadStories();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <p>Loading stories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Unable to load stories</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Choose Your Adventure</h1>
        <p className={styles.subtitle}>
          Select a story to begin your journey
        </p>
      </header>

      {stories.length === 0 ? (
        <div className={styles.empty}>
          <p>No stories available yet.</p>
          <p className={styles.emptyHint}>
            Add story files to the <code>/public/stories/</code> directory.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {stories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}

