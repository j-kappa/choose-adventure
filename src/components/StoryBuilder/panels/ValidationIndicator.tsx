import { useCallback } from 'react';
import { XCircle, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useStoryBuilderContext, type ValidationError } from '../../../context/StoryBuilderContext';
import styles from './ValidationIndicator.module.css';

interface ValidationIndicatorProps {
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function ValidationIndicator({ errors, warnings }: ValidationIndicatorProps) {
  const { setSelectedNodeId, nodes } = useStoryBuilderContext();
  
  const handleItemClick = useCallback((nodeId?: string) => {
    if (nodeId) {
      setSelectedNodeId(nodeId);
    }
  }, [setSelectedNodeId]);
  
  const totalIssues = errors.length + warnings.length;
  
  // Don't show anything if canvas is empty
  if (nodes.length === 0) {
    return null;
  }
  
  // Determine the icon and color based on status
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  
  return (
    <div className={styles.container}>
      <div className={`${styles.indicator} ${hasErrors ? styles.error : hasWarnings ? styles.warning : styles.success}`}>
        {hasErrors ? (
          <XCircle size={20} />
        ) : hasWarnings ? (
          <AlertTriangle size={20} />
        ) : (
          <CheckCircle size={20} />
        )}
        {totalIssues > 0 && (
          <span className={styles.count}>{totalIssues}</span>
        )}
      </div>
      
      <div className={styles.dropdown}>
        <div className={styles.header}>
          <AlertCircle size={16} />
          <span>Validation</span>
          {totalIssues === 0 ? (
            <span className={styles.badge + ' ' + styles.successBadge}>Ready</span>
          ) : (
            <>
              {errors.length > 0 && (
                <span className={styles.badge + ' ' + styles.errorBadge}>
                  {errors.length} error{errors.length !== 1 ? 's' : ''}
                </span>
              )}
              {warnings.length > 0 && (
                <span className={styles.badge + ' ' + styles.warningBadge}>
                  {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
                </span>
              )}
            </>
          )}
        </div>
        
        {totalIssues > 0 ? (
          <div className={styles.list}>
            {errors.map((error) => (
              <button 
                key={error.id} 
                className={styles.item}
                onClick={() => handleItemClick(error.nodeId)}
              >
                <span className={styles.itemIcon + ' ' + styles.errorIcon}>
                  <XCircle size={14} />
                </span>
                <span className={styles.itemText}>{error.message}</span>
              </button>
            ))}
            {warnings.map((warning) => (
              <button 
                key={warning.id} 
                className={styles.item}
                onClick={() => handleItemClick(warning.nodeId)}
              >
                <span className={styles.itemIcon + ' ' + styles.warningIcon}>
                  <AlertTriangle size={14} />
                </span>
                <span className={styles.itemText}>{warning.message}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.successMessage}>
            All checks passed. Your story is ready to export!
          </div>
        )}
      </div>
    </div>
  );
}

