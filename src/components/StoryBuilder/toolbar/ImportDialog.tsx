import { useState, useCallback, useRef } from 'react';
import { X, Upload, FileJson, AlertCircle } from 'lucide-react';
import type { Story } from '../../../types/story';
import styles from '../StoryBuilder.module.css';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (story: Story) => void;
}

export function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const story = JSON.parse(content) as Story;

        // Basic validation
        if (!story.id || !story.title || !story.passages || !story.start) {
          throw new Error('Invalid story format. Missing required fields (id, title, passages, start).');
        }

        if (!story.passages[story.start]) {
          throw new Error(`Start passage "${story.start}" not found in passages.`);
        }

        onImport(story);
        onClose();
      } catch (err) {
        if (err instanceof SyntaxError) {
          setError('Invalid JSON file. Please check the file format.');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to parse story file.');
        }
      }
    };

    reader.onerror = () => {
      setError('Failed to read file.');
    };

    reader.readAsText(file);
  }, [onImport, onClose]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
      processFile(file);
    } else {
      setError('Please drop a JSON file.');
    }
  }, [processFile]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (!isOpen) return null;

  return (
    <div className={styles.dialogOverlay} onClick={onClose}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Import Story</h2>
          <button onClick={onClose} className={styles.dialogCloseButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.dialogContent}>
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            <div className={styles.dropZoneIcon}>
              <FileJson size={40} />
            </div>
            
            <p className={styles.dropZoneText}>
              {fileName ? (
                <>Selected: <strong>{fileName}</strong></>
              ) : (
                <>Drop a <strong>.adventure.json</strong> file here</>
              )}
            </p>
            
            <p className={styles.dropZoneHint}>
              or click to browse
            </p>
          </div>

          {error && (
            <div className={styles.importError}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <p className={styles.importNote}>
            Importing a story will replace your current work. Make sure to export first if needed.
          </p>
        </div>

        <div className={styles.dialogActions}>
          <button onClick={onClose} className={`${styles.actionButton} ${styles.actionButtonSecondary}`}>
            Cancel
          </button>
          <button 
            onClick={handleBrowseClick} 
            className={styles.actionButton}
          >
            <Upload size={16} />
            Browse Files
          </button>
        </div>
      </div>
    </div>
  );
}

