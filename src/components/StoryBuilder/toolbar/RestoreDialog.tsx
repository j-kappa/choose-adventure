import { RotateCcw, Trash2, Clock } from 'lucide-react';
import type { SavedDraft } from '../hooks/useAutoSave';
import styles from '../StoryBuilder.module.css';

interface RestoreDialogProps {
  draft: SavedDraft;
  onRestore: () => void;
  onDiscard: () => void;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  
  return date.toLocaleDateString();
}

export function RestoreDialog({ draft, onRestore, onDiscard }: RestoreDialogProps) {
  const savedDate = new Date(draft.savedAt);
  const nodeCount = draft.nodes.length;
  const storyTitle = draft.metadata.title || 'Untitled Story';
  
  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialog} style={{ maxWidth: '420px' }}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Resume Previous Session?</h2>
        </div>
        
        <div className={styles.dialogContent}>
          <div className={styles.restoreDraftInfo}>
            <div className={styles.restoreDraftTitle}>
              <strong>{storyTitle}</strong>
            </div>
            <div className={styles.restoreDraftMeta}>
              <span className={styles.restoreDraftStat}>
                {nodeCount} node{nodeCount === 1 ? '' : 's'}
              </span>
              <span className={styles.restoreDraftTime}>
                <Clock size={14} />
                Saved {formatRelativeTime(savedDate)}
              </span>
            </div>
          </div>
          
          <p className={styles.restoreDraftText}>
            You have an unsaved story from your last session. Would you like to continue where you left off?
          </p>
        </div>
        
        <div className={styles.dialogActions}>
          <button 
            onClick={onDiscard} 
            className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
          >
            <Trash2 size={16} />
            Start Fresh
          </button>
          <button 
            onClick={onRestore} 
            className={styles.actionButton}
          >
            <RotateCcw size={16} />
            Restore
          </button>
        </div>
      </div>
    </div>
  );
}

