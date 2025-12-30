import { useEffect, useState, useMemo } from 'react';
import type { StoryManifestEntry } from '../../types/story';
import { getAvailableStories } from '../../utils/storyLoader';
import { StoryCard } from './StoryCard';
import { Footer } from '../Footer';
import styles from './StoryLibrary.module.css';

export function StoryLibrary() {
  const [stories, setStories] = useState<StoryManifestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredStories = useMemo(() => {
    if (!searchQuery.trim()) return stories;
    
    const query = searchQuery.toLowerCase();
    return stories.filter(story => 
      story.title.toLowerCase().includes(query) ||
      story.description.toLowerCase().includes(query) ||
      story.author.toLowerCase().includes(query)
    );
  }, [stories, searchQuery]);

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
        {stories.length > 0 && (
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search stories"
            />
          </div>
        )}
      </header>

      {stories.length === 0 ? (
        <div className={styles.empty}>
          <p>No stories available yet.</p>
          <p className={styles.emptyHint}>
            Add story files to the <code>/public/stories/</code> directory.
          </p>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className={styles.noResults}>
          <p>No stories found</p>
          <p>Try a different search term</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredStories.map((story, index) => (
            <StoryCard key={story.id} story={story} index={index} />
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}

