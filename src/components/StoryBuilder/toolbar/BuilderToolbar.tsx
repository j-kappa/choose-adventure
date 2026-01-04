import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Play, Upload, HelpCircle } from 'lucide-react';
import { useStoryBuilderContext, type ValidationError } from '../../../context/StoryBuilderContext';
import { ValidationIndicator } from '../panels/ValidationIndicator';
import styles from '../StoryBuilder.module.css';

interface BuilderToolbarProps {
  onExport: () => void;
  onImport: () => void;
  onTest: () => void;
  onHelp: () => void;
  hasErrors: boolean;
  canTest: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function BuilderToolbar({ onExport, onImport, onTest, onHelp, hasErrors, canTest, errors, warnings }: BuilderToolbarProps) {
  const { metadata, setMetadata, nodes, clearCanvas } = useStoryBuilderContext();
  
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMetadata({ ...metadata, title: e.target.value });
  }, [metadata, setMetadata]);
  
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <Link to="/" className={styles.backButton}>
          <ArrowLeft size={16} />
          Library
        </Link>
        
        <input
          type="text"
          className={styles.storyTitle}
          value={metadata.title}
          onChange={handleTitleChange}
          placeholder="Untitled Story"
        />
      </div>
      
      <div className={styles.toolbarRight}>
        <button
          className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
          onClick={clearCanvas}
          disabled={nodes.length === 0}
        >
          <Trash2 size={16} />
          Clear
        </button>
        
        <button
          className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
          onClick={onTest}
          disabled={!canTest}
        >
          <Play size={16} />
          Test
        </button>
        
        <ValidationIndicator errors={errors} warnings={warnings} />
        
        <div className={styles.toolbarDivider} />
        
        <button
          className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
          onClick={onImport}
        >
          <Upload size={16} />
          Import
        </button>
        
        <button
          className={styles.actionButton}
          onClick={onExport}
          disabled={hasErrors || nodes.length === 0}
        >
          <Download size={16} />
          Export
        </button>
        
        <button
          className={`${styles.actionButton} ${styles.actionButtonHelp}`}
          onClick={onHelp}
          title="Help & Guide"
        >
          <HelpCircle size={16} />
        </button>
      </div>
    </div>
  );
}

