import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import type { PassageNodeData } from '../../../context/StoryBuilderContext';
import { useNodeValidation } from '../../../context/ValidationContext';
import styles from './nodeStyles.module.css';

type PassageNodeProps = NodeProps & {
  data: PassageNodeData;
  selected?: boolean;
};

function PassageNodeComponent({ id, data, selected }: PassageNodeProps) {
  const { passageId, text, choices } = data;
  const { hasError, hasWarning } = useNodeValidation(id);
  
  return (
    <div className={`${styles.node} ${selected ? styles.selected : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        className={`${styles.handle} ${styles.handleTarget}`}
        id="in"
      />
      
      <div className={`${styles.header} ${styles.headerPassage}`}>
        <div className={styles.headerTitle}>
          <svg className={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Passage
        </div>
        {hasError && (
          <span className={styles.headerValidation}>
            <AlertCircle size={16} />
          </span>
        )}
        {!hasError && hasWarning && (
          <span className={styles.headerValidation}>
            <AlertTriangle size={16} />
          </span>
        )}
      </div>
      
      <div className={styles.body}>
        <span className={styles.passageId}>{passageId}</span>
        <p className={`${styles.textPreview} ${!text ? styles.empty : ''}`}>
          {text || 'Click to add passage text...'}
        </p>
        
        {choices.length > 0 && (
          <div className={styles.choices}>
            {choices.map((choice, index) => (
              <div key={choice.id} className={styles.choice}>
                <span className={styles.choiceNumber}>{index + 1}</span>
                <span className={styles.choiceText}>
                  {choice.text || 'Untitled choice'}
                </span>
                <Handle
                  type="source"
                  position={Position.Right}
                  className={`${styles.handle} ${styles.choiceHandle}`}
                  id={`choice-${choice.id}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const PassageNode = memo(PassageNodeComponent);

