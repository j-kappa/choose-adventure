import { useState, useCallback } from 'react';
import { X, RotateCcw, ArrowLeft, Flag } from 'lucide-react';
import type { Story, Passage, Choice } from '../../../types/story';
import styles from './StoryPreview.module.css';

interface StoryPreviewProps {
  story: Story;
  onClose: () => void;
}

export function StoryPreview({ story, onClose }: StoryPreviewProps) {
  const [currentPassageId, setCurrentPassageId] = useState(story.start);
  const [history, setHistory] = useState<string[]>([]);
  const [storyState, setStoryState] = useState<Record<string, boolean | string | number>>(
    story.initialState || {}
  );

  const currentPassage = story.passages[currentPassageId];

  const restart = useCallback(() => {
    setCurrentPassageId(story.start);
    setHistory([]);
    setStoryState(story.initialState || {});
  }, [story]);

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousId = newHistory.pop()!;
      setHistory(newHistory);
      setCurrentPassageId(previousId);
    }
  }, [history]);

  const makeChoice = useCallback((choice: Choice) => {
    // Apply state changes
    if (choice.setState) {
      setStoryState(prev => ({ ...prev, ...choice.setState }));
    }

    // Navigate to next passage
    setHistory(prev => [...prev, currentPassageId]);
    setCurrentPassageId(choice.goto);
  }, [currentPassageId]);

  // Filter choices based on conditions
  const getAvailableChoices = useCallback((): Choice[] => {
    if (!currentPassage?.choices) return [];

    return currentPassage.choices.filter(choice => {
      if (!choice.condition) return true;

      // Check all conditions
      return Object.entries(choice.condition).every(([key, value]) => {
        return storyState[key] === value;
      });
    });
  }, [currentPassage, storyState]);

  const availableChoices = getAvailableChoices();
  const isEnding = currentPassage?.isEnding;

  if (!currentPassage) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.header}>
            <h2 className={styles.title}>Preview Error</h2>
            <button onClick={onClose} className={styles.closeButton}>
              <X size={20} />
            </button>
          </div>
          <div className={styles.content}>
            <p className={styles.error}>
              Could not find passage: <code>{currentPassageId}</code>
            </p>
            <p className={styles.errorHint}>
              Make sure all your nodes are properly connected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>{story.title}</h2>
            <span className={styles.previewBadge}>Preview</span>
          </div>
          <div className={styles.headerActions}>
            {history.length > 0 && (
              <button onClick={goBack} className={styles.actionButton} title="Go back">
                <ArrowLeft size={18} />
              </button>
            )}
            <button onClick={restart} className={styles.actionButton} title="Restart">
              <RotateCcw size={18} />
            </button>
            <button onClick={onClose} className={styles.closeButton}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.passageText}>
            {currentPassage.text || <em className={styles.emptyText}>No text for this passage</em>}
          </div>

          {isEnding ? (
            <div className={styles.ending}>
              <div className={styles.endingBadge} data-type={currentPassage.endingType || 'neutral'}>
                <Flag size={16} />
                {currentPassage.endingType === 'good' && 'Good Ending'}
                {currentPassage.endingType === 'bad' && 'Bad Ending'}
                {currentPassage.endingType === 'neutral' && 'The End'}
                {!currentPassage.endingType && 'The End'}
              </div>
              <button onClick={restart} className={styles.restartButton}>
                Read Again
              </button>
            </div>
          ) : availableChoices.length > 0 ? (
            <div className={styles.choices}>
              {availableChoices.map((choice, index) => (
                <button
                  key={`${choice.goto}-${index}`}
                  className={styles.choiceButton}
                  onClick={() => makeChoice(choice)}
                >
                  <span className={styles.choiceNumber}>{index + 1}</span>
                  <span className={styles.choiceText}>{choice.text}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.noChoices}>
              <p>No choices available from this passage.</p>
              {history.length > 0 && (
                <button onClick={goBack} className={styles.restartButton}>
                  Go Back
                </button>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.passageId}>
            Passage: <code>{currentPassageId}</code>
          </span>
          {Object.keys(storyState).length > 0 && (
            <span className={styles.stateInfo}>
              State: {Object.entries(storyState).map(([k, v]) => `${k}=${String(v)}`).join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

