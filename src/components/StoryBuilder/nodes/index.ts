import { Play, FileText, Flag, ToggleRight, GitBranch, type LucideIcon } from 'lucide-react';
import { StartNode } from './StartNode';
import { PassageNode } from './PassageNode';
import { EndingNode } from './EndingNode';
import { StateNode } from './StateNode';
import { ConditionNode } from './ConditionNode';

/**
 * Registry of custom node types for React Flow
 */
export const nodeTypes = {
  start: StartNode,
  passage: PassageNode,
  ending: EndingNode,
  state: StateNode,
  condition: ConditionNode,
};

/**
 * Node type metadata for the toolbar
 */
export const nodeTypeInfo: {
  type: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}[] = [
  {
    type: 'start',
    label: 'Start',
    description: 'Story entry point (only one allowed)',
    icon: Play,
    color: '#22c55e',
  },
  {
    type: 'passage',
    label: 'Passage',
    description: 'Story text with choices',
    icon: FileText,
    color: '#3b82f6',
  },
  {
    type: 'ending',
    label: 'Ending',
    description: 'Terminal node (story ends here)',
    icon: Flag,
    color: '#6b7280',
  },
  {
    type: 'state',
    label: 'Set State',
    description: 'Update story state variables',
    icon: ToggleRight,
    color: '#a855f7',
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch based on state values',
    icon: GitBranch,
    color: '#f97316',
  },
];

export { StartNode, PassageNode, EndingNode, StateNode, ConditionNode };

