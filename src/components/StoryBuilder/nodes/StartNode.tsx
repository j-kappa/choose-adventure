import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { StartNodeData } from '../../../context/StoryBuilderContext';
import styles from './nodeStyles.module.css';

type StartNodeProps = NodeProps & {
  data: StartNodeData;
  selected?: boolean;
};

function StartNodeComponent({ data, selected }: StartNodeProps) {
  return (
    <div className={`${styles.node} ${selected ? styles.selected : ''}`}>
      <div className={`${styles.header} ${styles.headerStart}`}>
        <svg className={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        Start
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

