import { useCallback, useState } from 'react';
import { X, Download, Clipboard, Check, Mail } from 'lucide-react';
import styles from '../StoryBuilder.module.css';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storyJson: string;
  filename: string;
}

const SUBMISSION_EMAIL = import.meta.env.VITE_SUBMISSION_EMAIL || 'stories@example.com';

export function ExportDialog({ isOpen, onClose, storyJson, filename }: ExportDialogProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showSubmitInfo, setShowSubmitInfo] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  
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

  const handleCopyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SUBMISSION_EMAIL);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  }, []);
  
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
            
            {!showSubmitInfo ? (
              <button 
                className={`${styles.exportOption} ${styles.exportOptionHighlight}`} 
                onClick={() => setShowSubmitInfo(true)}
              >
                <div className={styles.exportOptionIcon}>
                  <Mail size={24} />
                </div>
                <div className={styles.exportOptionText}>
                  <div className={styles.exportOptionTitle}>
                    Submit for Publication
                  </div>
                  <div className={styles.exportOptionDescription}>
                    Get instructions to submit your story
                  </div>
                </div>
              </button>
            ) : (
              <div className={styles.submitInfo}>
                <div className={styles.submitInfoHeader}>
                  <Mail size={20} />
                  <span>Submit Your Story</span>
                </div>
                <div className={styles.submitInfoContent}>
                  <p>To submit your story for publication:</p>
                  <ol>
                    <li>Download your <strong>.adventure.json</strong> file using the button above</li>
                    <li>Send it as an attachment to:</li>
                  </ol>
                  <div className={styles.emailBox}>
                    <code>{SUBMISSION_EMAIL}</code>
                    <button 
                      className={styles.copyEmailButton}
                      onClick={handleCopyEmail}
                      title="Copy email address"
                    >
                      {emailCopied ? <Check size={16} /> : <Clipboard size={16} />}
                    </button>
                  </div>
                  <p className={styles.submitNote}>
                    Include your story title in the subject line. We'll review it and add it to the library if approved!
                  </p>
                </div>
              </div>
            )}
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

