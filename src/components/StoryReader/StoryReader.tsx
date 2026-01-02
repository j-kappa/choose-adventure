import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStory } from '../../hooks/useStory';
import { fetchStory } from '../../utils/storyLoader';
import { Passage } from './Passage';
import { ChoiceButton } from './ChoiceButton';
import { MobileStoryToolbar } from '../MobileStoryToolbar';
import styles from './StoryReader.module.css';

export function StoryReader() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const {
    story,
    currentPassage,
    currentPassageId,
    loadStory,
    makeChoice,
    goBack,
    restart,
    reset,
    canGoBack,
    getAvailableChoices,
    isEnding,
  } = useStory();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableChoices = getAvailableChoices();

  // Keyboard shortcuts for choices
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = event.key;
    const choiceIndex = parseInt(key, 10) - 1;

    if (choiceIndex >= 0 && choiceIndex < availableChoices.length && !isEnding) {
      makeChoice(availableChoices[choiceIndex]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [availableChoices, makeChoice, isEnding]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    async function load() {
      if (!storyId) {
        setError('No story ID provided');
        setLoading(false);
        return;
      }

      try {
        const storyData = await fetchStory(storyId);
        loadStory(storyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load story');
      } finally {
        setLoading(false);
      }
    }

    load();

    // Reset story state when leaving
    return () => {
      reset();
    };
  }, [storyId, loadStory, reset]);

  // Add body class for mobile toolbar visibility
  useEffect(() => {
    document.body.classList.add('story-page');
    return () => {
      document.body.classList.remove('story-page');
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <p>Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !story || !currentPassage) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Unable to load story</h2>
          <p>{error || 'Story not found'}</p>
          <Link to="/" className={styles.backLink}>
            ← Return to Library
          </Link>
        </div>
      </div>
    );
  }

  const handleBackToLibrary = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button 
          onClick={handleBackToLibrary} 
          className={styles.headerButton}
          title="Return to library"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span className={styles.headerButtonLabel}>Library</span>
        </button>

        <h1 className={styles.storyTitle}>{story.title}</h1>

        <div className={styles.headerActions}>
          {canGoBack && (
            <button 
              onClick={goBack} 
              className={styles.headerButton}
              title="Go back"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span className={styles.headerButtonLabel}>Back</span>
            </button>
          )}
          <button 
            onClick={restart} 
            className={styles.headerButton}
            title="Restart story"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            <span className={styles.headerButtonLabel}>Restart</span>
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <article className={styles.content}>
          <Passage 
            passage={currentPassage} 
            passageKey={currentPassageId || 'unknown'}
          />

          {isEnding ? (
            <div className={styles.ending}>
              <p className={styles.endingLabel}>
                The End
              </p>
              <div className={styles.endingActions}>
                <button onClick={restart} className={styles.endingLink}>
                  Read Again
                </button>
                <Link to="/" className={styles.endingLinkSecondary}>
                  Choose Another Story
                </Link>
              </div>
            </div>
          ) : availableChoices.length > 0 ? (
            <div className={styles.choices}>
              {availableChoices.map((choice, index) => (
                <ChoiceButton
                  key={`${choice.goto}-${index}`}
                  choice={choice}
                  index={index}
                  onClick={() => {
                    makeChoice(choice);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className={styles.noChoices}>
              <p>This passage has no available choices.</p>
              {canGoBack && (
                <button onClick={goBack} className={styles.endingButton}>
                  Go Back
                </button>
              )}
            </div>
          )}
        </article>
      </main>

      <MobileStoryToolbar
        canGoBack={canGoBack}
        onBack={goBack}
        onRestart={restart}
      />
    </div>
  );
}

