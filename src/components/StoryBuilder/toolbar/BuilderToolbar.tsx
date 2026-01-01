import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Play, Upload } from 'lucide-react';
import { useStoryBuilderContext } from '../../../context/StoryBuilderContext';
import { nodeTypeInfo } from '../nodes';
import styles from '../StoryBuilder.module.css';

interface BuilderToolbarProps {
  onExport: () => void;
  onImport: () => void;
  onTest: () => void;
  hasErrors: boolean;
  canTest: boolean;
}

export function BuilderToolbar({ onExport, onImport, onTest, hasErrors, canTest }: BuilderToolbarProps) {
  const { metadata, setMetadata, addNode, nodes, clearCanvas, isDirty } = useStoryBuilderContext();
  
  const handleAddNode = useCallback((type: string) => {
    // Calculate position for new node (center of viewport with offset)
    const existingOfType = nodes.filter(n => n.type === type).length;
    const position = {
      x: 100 + (existingOfType * 50),
      y: 100 + (existingOfType * 30),
    };
    addNode(type, position);
  }, [addNode, nodes]);
  
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMetadata({ ...metadata, title: e.target.value });
  }, [metadata, setMetadata]);
  
  const hasStartNode = nodes.some(n => n.type === 'start');
  
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
        
        {isDirty && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)' }}>
            Unsaved changes
          </span>
        )}
      </div>
      
      <div className={styles.toolbarCenter}>
        <div className={styles.nodePalette}>
          {nodeTypeInfo.map((info) => {
            const isStartDisabled = info.type === 'start' && hasStartNode;
            const IconComponent = info.icon;
            
            return (
              <button
                key={info.type}
                className={styles.nodeButton}
                onClick={() => handleAddNode(info.type)}
                disabled={isStartDisabled}
                style={{ opacity: isStartDisabled ? 0.5 : 1 }}
              >
                <IconComponent size={16} className={styles.nodeButtonIcon} />
                {info.label}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className={styles.toolbarRight}>
        <button
          className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
          onClick={onImport}
        >
          <Upload size={16} />
          Import
        </button>
        
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
        
        <button
          className={styles.actionButton}
          onClick={onExport}
          disabled={hasErrors || nodes.length === 0}
        >
          <Download size={16} />
          Export
        </button>
      </div>
    </div>
  );
}

