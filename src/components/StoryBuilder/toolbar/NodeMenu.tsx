import { useCallback, useMemo } from 'react';
import { useStoryBuilderContext } from '../../../context/StoryBuilderContext';
import { nodeTypeInfo } from '../nodes';
import styles from './NodeMenu.module.css';

// Only show these node types in the menu (state/condition logic moved to choices)
const visibleNodeTypes = ['start', 'passage', 'ending'];

export function NodeMenu() {
  const { addNode, nodes } = useStoryBuilderContext();
  
  const handleAddNode = useCallback((type: string) => {
    const nodeSpacing = 300;
    
    if (nodes.length === 0) {
      addNode(type, { x: 100, y: 100 });
    } else {
      const rightmostX = Math.max(...nodes.map(n => n.position.x));
      const rightmostNode = nodes.find(n => n.position.x === rightmostX)!;
      
      const position = {
        x: rightmostX + nodeSpacing,
        y: rightmostNode.position.y,
      };
      addNode(type, position);
    }
  }, [addNode, nodes]);
  
  const hasStartNode = nodes.some(n => n.type === 'start');
  
  // Filter to only show the simplified node types
  const filteredNodeTypes = useMemo(() => 
    nodeTypeInfo.filter(info => visibleNodeTypes.includes(info.type)),
    []
  );
  
  return (
    <div className={styles.menu}>
      {filteredNodeTypes.map((info) => {
        const isStartDisabled = info.type === 'start' && hasStartNode;
        const IconComponent = info.icon;
        
        return (
          <button
            key={info.type}
            className={styles.button}
            onClick={() => handleAddNode(info.type)}
            disabled={isStartDisabled}
            data-tooltip={info.label}
            style={{ 
              '--node-color': info.color,
              opacity: isStartDisabled ? 0.4 : 1,
            } as React.CSSProperties}
          >
            <IconComponent size={18} />
          </button>
        );
      })}
    </div>
  );
}

