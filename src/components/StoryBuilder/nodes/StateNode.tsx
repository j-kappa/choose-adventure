import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { StateNodeData } from '../../../context/StoryBuilderContext';
import styles from './nodeStyles.module.css';

type StateNodeProps = NodeProps & {
  data: StateNodeData;
  selected?: boolean;
};

function StateNodeComponent({ data, selected }: StateNodeProps) {
  const { stateChanges } = data;
  
  return (
    <div className={`${styles.node} ${selected ? styles.selected : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        className={`${styles.handle} ${styles.handleTarget}`}
        id="in"
      />
      
      <div className={`${styles.header} ${styles.headerState}`}>
        <svg className={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20V10" />
          <path d="M18 20V4" />
          <path d="M6 20v-4" />
        </svg>
        Set State
      </div>
      
      <div className={styles.body}>
        {stateChanges.length > 0 ? (
          <div className={styles.stateChanges}>
            {stateChanges.map((change, index) => (
              <div key={index} className={styles.stateChange}>
                <span className={styles.stateKey}>{change.key}</span>
                {' = '}
                {JSON.stringify(change.value)}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>No state changes defined</p>
        )}
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

export const StateNode = memo(StateNodeComponent);

