import { useCallback } from 'react';
import { XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStoryBuilderContext, type ValidationError } from '../../../context/StoryBuilderContext';
import styles from '../StoryBuilder.module.css';

interface ValidationPanelProps {
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function ValidationPanel({ errors, warnings }: ValidationPanelProps) {
  const { setSelectedNodeId, nodes } = useStoryBuilderContext();
  
  const handleItemClick = useCallback((nodeId?: string) => {
    if (nodeId) {
      setSelectedNodeId(nodeId);
    }
  }, [setSelectedNodeId]);
  
  const totalIssues = errors.length + warnings.length;
  
  if (nodes.length === 0) {
    return null;
  }
  
  return (
    <div className={styles.validationPanel}>
      <div className={styles.validationHeader}>
        <span className={styles.validationTitle}>Validation</span>
        {totalIssues === 0 ? (
          <span className={`${styles.validationCount} ${styles.success}`}>
            <CheckCircle size={12} style={{ marginRight: '4px' }} />
            Ready
          </span>
        ) : (
          <>
            {errors.length > 0 && (
              <span className={`${styles.validationCount} ${styles.errors}`}>
                {errors.length} error{errors.length !== 1 ? 's' : ''}
              </span>
            )}
            {warnings.length > 0 && (
              <span className={`${styles.validationCount} ${styles.warnings}`}>
                {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
              </span>
            )}
          </>
        )}
      </div>
      
      {totalIssues > 0 && (
        <div className={styles.validationList}>
          {errors.map((error) => (
            <div 
              key={error.id} 
              className={styles.validationItem}
              onClick={() => handleItemClick(error.nodeId)}
            >
              <span className={`${styles.validationIcon} ${styles.error}`}>
                <XCircle size={14} />
              </span>
              <span>{error.message}</span>
            </div>
          ))}
          {warnings.map((warning) => (
            <div 
              key={warning.id} 
              className={styles.validationItem}
              onClick={() => handleItemClick(warning.nodeId)}
            >
              <span className={`${styles.validationIcon} ${styles.warning}`}>
                <AlertTriangle size={14} />
              </span>
              <span>{warning.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

