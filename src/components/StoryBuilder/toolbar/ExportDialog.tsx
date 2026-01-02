import { useCallback, useState, useMemo } from 'react';
import { X, Download, Clipboard, Check, Send } from 'lucide-react';
import styles from '../StoryBuilder.module.css';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storyJson: string;
  filename: string;
  storyTitle?: string;
}

const SUBMISSION_EMAIL = import.meta.env.VITE_SUBMISSION_EMAIL || 'stories@example.com';

export function ExportDialog({ isOpen, onClose, storyJson, filename, storyTitle }: ExportDialogProps) {
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

  const mailtoLink = useMemo(() => {
    const subject = encodeURIComponent(`Story Submission: ${storyTitle || filename}`);
    const body = encodeURIComponent(
      `Hi!\n\nI'd like to submit my story "${storyTitle || filename}" for publication.\n\n` +
      `Please find the story JSON attached or pasted below.\n\n` +
      `---\n\n` +
      `If the story is too long to paste here, please:\n` +
      `1. Download the story using the "Download File" option\n` +
      `2. Attach the .adventure.json file to this email\n\n` +
      `---\n\nStory JSON:\n\n${storyJson.length <= 5000 ? storyJson : '[Story too large - please attach the downloaded file]'}`
    );
    return `mailto:${SUBMISSION_EMAIL}?subject=${subject}&body=${body}`;
  }, [storyJson, storyTitle, filename]);

  const handleSubmit = useCallback(() => {
    window.location.href = mailtoLink;
  }, [mailtoLink]);
  
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

            <div className={styles.exportDivider}>
              <span>Want to share your story?</span>
            </div>
            
            <button className={`${styles.exportOption} ${styles.exportOptionHighlight}`} onClick={handleSubmit}>
              <div className={styles.exportOptionIcon}>
                <Send size={24} />
              </div>
              <div className={styles.exportOptionText}>
                <div className={styles.exportOptionTitle}>
                  Submit for Publication
                </div>
                <div className={styles.exportOptionDescription}>
                  Email your story to be added to the library
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

