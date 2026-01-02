import { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Download, 
  Clipboard, 
  Check,
  Play,
  X,
  BookOpen,
  User,
  Hash,
  Flag,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import type { Story, Choice } from '../../types/story';
import styles from './Admin.module.css';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface StoryStats {
  passageCount: number;
  endingCount: number;
  choiceCount: number;
  endings: { id: string; type?: string }[];
}

export function StoryReview() {
  const [story, setStory] = useState<Story | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [stats, setStats] = useState<StoryStats | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [downloadedFile, setDownloadedFile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateStory = useCallback((story: Story): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!story.id) errors.push('Missing required field: id');
    if (!story.title) errors.push('Missing required field: title');
    if (!story.author) errors.push('Missing required field: author');
    if (!story.start) errors.push('Missing required field: start');
    if (!story.passages) errors.push('Missing required field: passages');

    // Check start passage exists
    if (story.passages && story.start && !story.passages[story.start]) {
      errors.push(`Start passage "${story.start}" not found in passages`);
    }

    // Check all choice targets exist
    if (story.passages) {
      Object.entries(story.passages).forEach(([passageId, passage]) => {
        if (passage.choices) {
          passage.choices.forEach((choice, index) => {
            if (!choice.goto) {
              errors.push(`Passage "${passageId}" choice ${index + 1} has no goto target`);
            } else if (!story.passages[choice.goto]) {
              errors.push(`Passage "${passageId}" choice ${index + 1} references non-existent passage "${choice.goto}"`);
            }
            if (!choice.text) {
              warnings.push(`Passage "${passageId}" choice ${index + 1} has no text`);
            }
          });
        }
      });

      // Check for orphaned passages (not reachable from start)
      const reachable = new Set<string>();
      const queue = [story.start];
      while (queue.length > 0) {
        const id = queue.shift()!;
        if (reachable.has(id)) continue;
        reachable.add(id);
        const passage = story.passages[id];
        if (passage?.choices) {
          passage.choices.forEach(c => {
            if (c.goto && !reachable.has(c.goto)) {
              queue.push(c.goto);
            }
          });
        }
      }

      const orphaned = Object.keys(story.passages).filter(id => !reachable.has(id));
      if (orphaned.length > 0) {
        warnings.push(`${orphaned.length} passage(s) are not reachable from start: ${orphaned.slice(0, 3).join(', ')}${orphaned.length > 3 ? '...' : ''}`);
      }

      // Check for passages with no choices and not marked as ending
      Object.entries(story.passages).forEach(([id, passage]) => {
        if (!passage.isEnding && (!passage.choices || passage.choices.length === 0)) {
          warnings.push(`Passage "${id}" has no choices and is not marked as an ending`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  const calculateStats = useCallback((story: Story): StoryStats => {
    const passages = Object.entries(story.passages);
    const endings = passages
      .filter(([, p]) => p.isEnding)
      .map(([id, p]) => ({ id, type: p.endingType }));
    
    let choiceCount = 0;
    passages.forEach(([, p]) => {
      if (p.choices) choiceCount += p.choices.length;
    });

    return {
      passageCount: passages.length,
      endingCount: endings.length,
      choiceCount,
      endings
    };
  }, []);

  const processJson = useCallback((text: string) => {
    setJsonText(text);
    
    try {
      const parsed = JSON.parse(text);
      setStory(parsed);
      setValidation(validateStory(parsed));
      setStats(calculateStats(parsed));
    } catch {
      setStory(null);
      setValidation({
        isValid: false,
        errors: ['Invalid JSON: Failed to parse'],
        warnings: []
      });
      setStats(null);
    }
  }, [validateStory, calculateStats]);

  const handleFileInput = useCallback((file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setValidation({
        isValid: false,
        errors: ['Please upload a .json file'],
        warnings: []
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      processJson(text);
    };
    reader.readAsText(file);
  }, [processJson]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFileInput(file);
  }, [handleFileInput]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (!story) return;

    const blob = new Blob([JSON.stringify(story, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.id}.adventure.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedFile(true);
    setTimeout(() => setDownloadedFile(false), 2000);
  }, [story]);

  const handleCopyManifest = useCallback(async () => {
    if (!story) return;

    const manifestEntry = {
      id: story.id,
      title: story.title,
      author: story.author,
      description: story.description || '',
      file: `${story.id}.adventure.json`,
      tags: []
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(manifestEntry, null, 2));
      setCopiedManifest(true);
      setTimeout(() => setCopiedManifest(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [story]);

  const handleClear = useCallback(() => {
    setStory(null);
    setJsonText('');
    setValidation(null);
    setStats(null);
  }, []);

  return (
    <div className={styles.reviewContainer}>
      {!story ? (
        <div className={styles.importSection}>
          <div
            className={`${styles.dropZone} ${isDragActive ? styles.dropZoneActive : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={(e) => e.target.files?.[0] && handleFileInput(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <Upload size={48} className={styles.dropZoneIcon} />
            <p className={styles.dropZoneText}>
              <strong>Drop a story file here</strong> or click to browse
            </p>
            <p className={styles.dropZoneHint}>Accepts .adventure.json files</p>
          </div>

          <div className={styles.divider}>
            <span>or paste JSON directly</span>
          </div>

          <textarea
            className={styles.jsonInput}
            placeholder="Paste your story JSON here..."
            value={jsonText}
            onChange={(e) => processJson(e.target.value)}
            rows={12}
          />

          {validation && !validation.isValid && (
            <div className={styles.errorBox}>
              <XCircle size={20} />
              <div>
                {validation.errors.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.reviewSection}>
          <div className={styles.storyHeader}>
            <div className={styles.storyInfo}>
              <h2 className={styles.storyTitle}>
                <BookOpen size={24} />
                {story.title}
              </h2>
              <div className={styles.storyMeta}>
                <span><User size={14} /> {story.author}</span>
                <span><Hash size={14} /> {story.id}</span>
              </div>
              {story.description && (
                <p className={styles.storyDescription}>{story.description}</p>
              )}
            </div>
            <button className={styles.clearButton} onClick={handleClear}>
              <X size={18} />
              Clear
            </button>
          </div>

          {/* Validation Status */}
          <div className={styles.validationSection}>
            <h3 className={styles.sectionTitle}>Validation</h3>
            {validation?.isValid ? (
              <div className={styles.successBox}>
                <CheckCircle size={20} />
                <span>Story is valid and ready for publication</span>
              </div>
            ) : (
              <div className={styles.errorBox}>
                <XCircle size={20} />
                <div>
                  {validation?.errors.map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                </div>
              </div>
            )}
            {validation?.warnings && validation.warnings.length > 0 && (
              <div className={styles.warningBox}>
                <AlertTriangle size={20} />
                <div>
                  {validation.warnings.map((warn, i) => (
                    <p key={i}>{warn}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          {stats && (
            <div className={styles.statsSection}>
              <h3 className={styles.sectionTitle}>Statistics</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{stats.passageCount}</div>
                  <div className={styles.statLabel}>Passages</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{stats.choiceCount}</div>
                  <div className={styles.statLabel}>Choices</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{stats.endingCount}</div>
                  <div className={styles.statLabel}>Endings</div>
                </div>
              </div>
              {stats.endings.length > 0 && (
                <div className={styles.endingsList}>
                  <h4>Endings:</h4>
                  <div className={styles.endingTags}>
                    {stats.endings.map(e => (
                      <span 
                        key={e.id} 
                        className={styles.endingTag}
                        data-type={e.type || 'neutral'}
                      >
                        <Flag size={12} />
                        {e.id} ({e.type || 'neutral'})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          <div className={styles.previewSection}>
            <h3 className={styles.sectionTitle}>Test Play</h3>
            <button 
              className={styles.previewButton}
              onClick={() => setShowPreview(true)}
              disabled={!validation?.isValid}
            >
              <Play size={18} />
              Play Through Story
            </button>
          </div>

          {/* Export */}
          {validation?.isValid && (
            <div className={styles.exportSection}>
              <h3 className={styles.sectionTitle}>Export for Release</h3>
              <div className={styles.exportButtons}>
                <button className={styles.exportButton} onClick={handleDownload}>
                  {downloadedFile ? <Check size={18} /> : <Download size={18} />}
                  {downloadedFile ? 'Downloaded!' : `Download ${story.id}.adventure.json`}
                </button>
                <button className={styles.exportButton} onClick={handleCopyManifest}>
                  {copiedManifest ? <Check size={18} /> : <Clipboard size={18} />}
                  {copiedManifest ? 'Copied!' : 'Copy Manifest Entry'}
                </button>
              </div>
              <div className={styles.instructions}>
                <h4>To publish this story:</h4>
                <ol>
                  <li>Download the .adventure.json file</li>
                  <li>Place it in <code>public/stories/</code></li>
                  <li>Copy the manifest entry and add it to <code>public/stories/manifest.json</code></li>
                  <li>Commit and deploy</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && story && (
        <StoryPreviewModal story={story} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}

// Inline preview modal (simplified from StoryBuilder's StoryPreview)
function StoryPreviewModal({ story, onClose }: { story: Story; onClose: () => void }) {
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
    if (choice.setState) {
      setStoryState(prev => ({ ...prev, ...choice.setState }));
    }
    setHistory(prev => [...prev, currentPassageId]);
    setCurrentPassageId(choice.goto);
  }, [currentPassageId]);

  const getAvailableChoices = useCallback((): Choice[] => {
    if (!currentPassage?.choices) return [];
    return currentPassage.choices.filter(choice => {
      if (!choice.condition) return true;
      return Object.entries(choice.condition).every(([key, value]) => {
        return storyState[key] === value;
      });
    });
  }, [currentPassage, storyState]);

  const availableChoices = getAvailableChoices();
  const isEnding = currentPassage?.isEnding;

  return (
    <div className={styles.previewOverlay} onClick={onClose}>
      <div className={styles.previewModal} onClick={e => e.stopPropagation()}>
        <div className={styles.previewHeader}>
          <h2>{story.title}</h2>
          <div className={styles.previewActions}>
            {history.length > 0 && (
              <button onClick={goBack} className={styles.previewActionBtn} title="Go back">
                <ArrowLeft size={18} />
              </button>
            )}
            <button onClick={restart} className={styles.previewActionBtn} title="Restart">
              <RotateCcw size={18} />
            </button>
            <button onClick={onClose} className={styles.previewCloseBtn}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={styles.previewContent}>
          {!currentPassage ? (
            <div className={styles.previewError}>
              <p>Could not find passage: <code>{currentPassageId}</code></p>
            </div>
          ) : (
            <>
              <div className={styles.previewText}>
                {currentPassage.text || <em>No text for this passage</em>}
              </div>

              {isEnding ? (
                <div className={styles.previewEnding}>
                  <div className={styles.endingBadgeLarge} data-type={currentPassage.endingType || 'neutral'}>
                    <Flag size={20} />
                    {currentPassage.endingType === 'good' && 'Good Ending'}
                    {currentPassage.endingType === 'bad' && 'Bad Ending'}
                    {(!currentPassage.endingType || currentPassage.endingType === 'neutral') && 'The End'}
                  </div>
                  <button onClick={restart} className={styles.restartBtn}>
                    Play Again
                  </button>
                </div>
              ) : availableChoices.length > 0 ? (
                <div className={styles.previewChoices}>
                  {availableChoices.map((choice, index) => (
                    <button
                      key={`${choice.goto}-${index}`}
                      className={styles.choiceBtn}
                      onClick={() => makeChoice(choice)}
                    >
                      <span className={styles.choiceNum}>{index + 1}</span>
                      <span>{choice.text}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.noChoices}>
                  <p>No choices available.</p>
                  {history.length > 0 && (
                    <button onClick={goBack} className={styles.restartBtn}>Go Back</button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.previewFooter}>
          <span>Passage: <code>{currentPassageId}</code></span>
          {Object.keys(storyState).length > 0 && (
            <span>State: {Object.entries(storyState).map(([k, v]) => `${k}=${String(v)}`).join(', ')}</span>
          )}
        </div>
      </div>
    </div>
  );
}

