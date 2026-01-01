import { useCallback, useState } from 'react';
import { X, Download, Clipboard, Check } from 'lucide-react';
import styles from '../StoryBuilder.module.css';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storyJson: string;
  filename: string;
}

export function ExportDialog({ isOpen, onClose, storyJson, filename }: ExportDialogProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  
  const handleDownload = useCallback(() => {
    const blob = new Blob([storyJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.adventure.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }, [storyJson, filename]);
  
  const handleCopyClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(storyJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [storyJson]);
  
  if (!isOpen) return null;
  
  return (
    <div className={styles.dialogOverlay} onClick={onClose}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Export Story</h2>
          <button className={styles.dialogCloseButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.dialogContent}>
          <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
            Your story is ready to export. Choose how you'd like to save it:
          </p>
          
          <div className={styles.exportOptions}>
            <button className={styles.exportOption} onClick={handleDownload}>
              <div className={styles.exportOptionIcon}>
                {downloaded ? <Check size={24} /> : <Download size={24} />}
              </div>
              <div className={styles.exportOptionText}>
                <div className={styles.exportOptionTitle}>
                  {downloaded ? 'Downloaded!' : 'Download File'}
                </div>
                <div className={styles.exportOptionDescription}>
                  Save as {filename}.adventure.json
                </div>
              </div>
            </button>
            
            <button className={styles.exportOption} onClick={handleCopyClipboard}>
              <div className={styles.exportOptionIcon}>
                {copied ? <Check size={24} /> : <Clipboard size={24} />}
              </div>
              <div className={styles.exportOptionText}>
                <div className={styles.exportOptionTitle}>
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </div>
                <div className={styles.exportOptionDescription}>
                  Copy the JSON to paste elsewhere
                </div>
              </div>
            </button>
          </div>
        </div>
        
        <div className={styles.dialogActions}>
          <button 
            className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

