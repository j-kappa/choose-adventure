import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
      story.author.toLowerCase().includes(query) ||
      story.tags?.some(tag => tag.toLowerCase().includes(query))
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
        <h1 className={styles.title}>Adventure Engine</h1>
        <p className={styles.subtitle}>
          Select a story to begin your journey
        </p>
        {stories.length > 0 && (
          <div className={styles.searchRow}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by title, author, description, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search stories by title, author, description, or tag"
            />
            <Link to="/builder" className={styles.createButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Story
            </Link>
          </div>
        )}
        {stories.length === 0 && (
          <div className={styles.headerActions}>
            <Link to="/builder" className={styles.createButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Story
            </Link>
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

