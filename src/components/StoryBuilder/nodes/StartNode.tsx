import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import type { StartNodeData } from '../../../context/StoryBuilderContext';
import { useNodeValidation } from '../../../context/ValidationContext';
import styles from './nodeStyles.module.css';

type StartNodeProps = NodeProps & {
  data: StartNodeData;
  selected?: boolean;
};

function StartNodeComponent({ id, data, selected }: StartNodeProps) {
  const { hasError, hasWarning } = useNodeValidation(id);
  
  return (
    <div className={`${styles.node} ${selected ? styles.selected : ''}`}>
      <div className={`${styles.header} ${styles.headerStart}`}>
        <div className={styles.headerTitle}>
          <svg className={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Start
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
        <p className={styles.textPreview}>{data.label}</p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={`${styles.handle} ${styles.handleSource}`}
        id="out"
      />
    </div>
  );
}

export const StartNode = memo(StartNodeComponent);

