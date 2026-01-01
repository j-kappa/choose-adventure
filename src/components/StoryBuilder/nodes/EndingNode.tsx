import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import type { EndingNodeData } from '../../../context/StoryBuilderContext';
import { useNodeValidation } from '../../../context/ValidationContext';
import styles from './nodeStyles.module.css';

type EndingNodeProps = NodeProps & {
  data: EndingNodeData;
  selected?: boolean;
};

const endingTypeLabels = {
  good: 'Good Ending',
  bad: 'Bad Ending',
  neutral: 'Neutral Ending',
};

function EndingNodeComponent({ id, data, selected }: EndingNodeProps) {
  const { passageId, text, endingType } = data;
  const { hasError, hasWarning } = useNodeValidation(id);
  
  const headerClass = {
    good: styles.headerEndingGood,
    bad: styles.headerEndingBad,
    neutral: styles.headerEndingNeutral,
  }[endingType];
  
  return (
    <div className={`${styles.node} ${selected ? styles.selected : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        className={`${styles.handle} ${styles.handleTarget}`}
        id="in"
      />
      
      <div className={`${styles.header} ${headerClass}`}>
        <div className={styles.headerTitle}>
          <svg className={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          Ending
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
          {text || 'Click to add ending text...'}
        </p>
        <span className={`${styles.endingTypeBadge} ${styles[endingType]}`}>
          {endingType === 'good' && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {endingType === 'bad' && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
          {endingType === 'neutral' && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
          {endingTypeLabels[endingType]}
        </span>
      </div>
    </div>
  );
}

export const EndingNode = memo(EndingNodeComponent);

