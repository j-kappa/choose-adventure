import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import type { ConditionNodeData } from '../../../context/StoryBuilderContext';
import { useNodeValidation } from '../../../context/ValidationContext';
import styles from './nodeStyles.module.css';

type ConditionNodeProps = NodeProps & {
  data: ConditionNodeData;
  selected?: boolean;
};

function ConditionNodeComponent({ id, data, selected }: ConditionNodeProps) {
  const { conditions } = data;
  const { hasError, hasWarning } = useNodeValidation(id);
  
  return (
    <div className={`${styles.node} ${selected ? styles.selected : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        className={`${styles.handle} ${styles.handleTarget}`}
        id="in"
      />
      
      <div className={`${styles.header} ${styles.headerCondition}`}>
        <div className={styles.headerTitle}>
        <svg className={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        Condition
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
        {conditions.length > 0 ? (
          <div className={styles.conditions}>
            {conditions.map((cond, index) => (
              <div key={index} className={styles.condition}>
                <span className={styles.stateKey}>{cond.key}</span>
                {' '}{cond.operator}{' '}
                {JSON.stringify(cond.value)}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>No conditions defined</p>
        )}
        
        <div className={styles.choices} style={{ marginTop: 'var(--space-3)' }}>
          <div className={styles.choice}>
            <span className={styles.choiceNumber} style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>✓</span>
            <span className={styles.choiceText}>True path</span>
            <Handle
              type="source"
              position={Position.Right}
              className={`${styles.handle} ${styles.choiceHandle}`}
              id="true"
            />
          </div>
          <div className={styles.choice}>
            <span className={styles.choiceNumber} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>✗</span>
            <span className={styles.choiceText}>False path</span>
            <Handle
              type="source"
              position={Position.Right}
              className={`${styles.handle} ${styles.choiceHandle}`}
              id="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const ConditionNode = memo(ConditionNodeComponent);

