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
  const { metadata, setMetadata, addNode, nodes, clearCanvas } = useStoryBuilderContext();
  
  const handleAddNode = useCallback((type: string) => {
    // Node width + 40px gap (nodes are 220-280px wide)
    const nodeSpacing = 300;
    
    if (nodes.length === 0) {
      // First node - place at starting position
      addNode(type, { x: 100, y: 100 });
    } else {
      // Find the rightmost node position
      const rightmostX = Math.max(...nodes.map(n => n.position.x));
      const rightmostNode = nodes.find(n => n.position.x === rightmostX)!;
      
      // Place new node to the right with fixed spacing
      const position = {
        x: rightmostX + nodeSpacing,
        y: rightmostNode.position.y,
      };
      addNode(type, position);
    }
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

