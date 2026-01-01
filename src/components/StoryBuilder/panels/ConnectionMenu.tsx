import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, Flag, ToggleRight, GitBranch } from 'lucide-react';
import styles from './ConnectionMenu.module.css';

interface ConnectionMenuProps {
  position: { x: number; y: number };
  onSelect: (nodeType: string) => void;
  onClose: () => void;
}

const menuItems = [
  { type: 'passage', label: 'Passage', icon: FileText, description: 'Story content with choices' },
  { type: 'ending', label: 'Ending', icon: Flag, description: 'End of a story path' },
  { type: 'state', label: 'Set State', icon: ToggleRight, description: 'Modify story variables' },
  { type: 'condition', label: 'Condition', icon: GitBranch, description: 'Branch based on state' },
];

// Menu dimensions (approximate)
const MENU_WIDTH = 220;
const MENU_HEIGHT = 220;
const PADDING = 10;

export function ConnectionMenu({ position, onSelect, onClose }: ConnectionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to keep menu within viewport
  useEffect(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let x = position.x;
    let y = position.y;
    
    // Adjust if menu would go off right edge
    if (x + MENU_WIDTH + PADDING > viewportWidth) {
      x = viewportWidth - MENU_WIDTH - PADDING;
    }
    
    // Adjust if menu would go off left edge
    if (x < PADDING) {
      x = PADDING;
    }
    
    // Adjust if menu would go off bottom edge
    if (y + MENU_HEIGHT + PADDING > viewportHeight) {
      y = viewportHeight - MENU_HEIGHT - PADDING;
    }
    
    // Adjust if menu would go off top edge
    if (y < PADDING) {
      y = PADDING;
    }
    
    setAdjustedPosition({ x, y });
  }, [position]);

  // Close on click outside - with delay to prevent immediate close from drag release
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Close on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Delay adding the mousedown listener to avoid the drag release closing the menu
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSelect = useCallback((type: string) => {
    onSelect(type);
    onClose();
  }, [onSelect, onClose]);

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <div className={styles.header}>Add Node</div>
      <div className={styles.items}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              className={styles.item}
              onClick={() => handleSelect(item.type)}
            >
              <Icon size={18} className={styles.icon} />
              <div className={styles.itemContent}>
                <span className={styles.label}>{item.label}</span>
                <span className={styles.description}>{item.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

