import { createContext, useContext, useCallback, useState, useEffect, useRef, type ReactNode } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import type { Story, Passage } from '../types/story';

/**
 * Node data types for the story builder
 * Each interface includes an index signature to satisfy Record<string, unknown> constraint
 */
export interface StateVariable {
  key: string;
  value: string | number | boolean;
}

export interface StartNodeData {
  label: string;
  initialState: StateVariable[];
  [key: string]: unknown;
}

export interface ChoiceCondition {
  key: string;
  value: string | number | boolean;
}

export interface ChoiceStateChange {
  key: string;
  value: string | number | boolean;
}

export interface BuilderChoice {
  id: string;
  text: string;
  condition?: ChoiceCondition;
  setState?: ChoiceStateChange;
}

export interface PassageNodeData {
  passageId: string;
  text: string;
  choices: BuilderChoice[];
  [key: string]: unknown;
}

export interface EndingNodeData {
  passageId: string;
  text: string;
  endingType: 'good' | 'bad' | 'neutral';
  [key: string]: unknown;
}

export interface StateNodeData {
  stateChanges: { key: string; value: string | number | boolean }[];
  [key: string]: unknown;
}

export interface ConditionNodeData {
  conditions: { key: string; operator: '==' | '!=' | '>' | '<' | '>=' | '<='; value: string | number | boolean }[];
  [key: string]: unknown;
}

export type BuilderNodeData = 
  | StartNodeData 
  | PassageNodeData 
  | EndingNodeData 
  | StateNodeData 
  | ConditionNodeData;

export type BuilderNode = Node<BuilderNodeData>;
export type BuilderEdge = Edge;

/**
 * Story metadata
 */
export interface StoryMetadata {
  id: string;
  title: string;
  author: string;
  description: string;
  version: string;
}

/**
 * Validation error
 */
export interface ValidationError {
  id: string;
  nodeId?: string;
  type: 'error' | 'warning';
  message: string;
}

/**
 * Undo action for tracking deletions
 */
interface UndoAction {
  type: 'delete-node' | 'delete-edge';
  node?: BuilderNode;
  edges?: BuilderEdge[];
  edge?: BuilderEdge;
}

/**
 * Story Builder Context State
 */
interface StoryBuilderContextState {
  // React Flow state
  nodes: BuilderNode[];
  edges: BuilderEdge[];
  onNodesChange: OnNodesChange<BuilderNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  
  // Selection
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  
  // Story metadata
  metadata: StoryMetadata;
  setMetadata: (metadata: StoryMetadata) => void;
  
  // Node operations
  addNode: (type: string, position: { x: number; y: number }) => void;
  addNodeWithConnection: (
    type: string, 
    position: { x: number; y: number },
    sourceNodeId: string,
    sourceHandleId?: string | null
  ) => void;
  updateNodeData: (nodeId: string, data: Partial<BuilderNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  
  // Validation
  validationErrors: ValidationError[];
  
  // Draft management
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  clearCanvas: () => void;
  restoreDraft: (nodes: BuilderNode[], edges: BuilderEdge[], metadata: StoryMetadata) => void;
  importStory: (story: Story) => void;
  
  // Undo
  undo: () => void;
  canUndo: boolean;
}

const StoryBuilderContext = createContext<StoryBuilderContextState | null>(null);

/**
 * Generate unique IDs for nodes
 */
let nodeIdCounter = 0;
const generateNodeId = (type: string) => {
  nodeIdCounter++;
  return `${type}-${nodeIdCounter}-${Date.now()}`;
};

/**
 * Generate passage IDs from node label
 */
const generatePassageId = (label: string) => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30) || 'passage';
};

/**
 * Default node data factories
 */
const createDefaultNodeData = (type: string): BuilderNodeData => {
  switch (type) {
    case 'start':
      return { label: 'Story Start', initialState: [] };
    case 'passage':
      return {
        passageId: generatePassageId('New Passage'),
        text: '',
        choices: [{ id: `choice-${Date.now()}`, text: 'Continue' }],
      };
    case 'ending':
      return {
        passageId: generatePassageId('Ending'),
        text: '',
        endingType: 'neutral',
      };
    case 'state':
      return {
        stateChanges: [],
      };
    case 'condition':
      return {
        conditions: [],
      };
    default:
      return { label: 'Unknown' } as StartNodeData;
  }
};

interface StoryBuilderProviderProps {
  children: ReactNode;
}

export function StoryBuilderProvider({ children }: StoryBuilderProviderProps) {
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<BuilderNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<BuilderEdge>([]);
  
  // Selection state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Story metadata
  const [metadata, setMetadata] = useState<StoryMetadata>({
    id: '',
    title: 'Untitled Story',
    author: '',
    description: '',
    version: '1.0',
  });
  
  // Dirty state for unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  
  // Validation errors (computed later in validation hook)
  const [validationErrors] = useState<ValidationError[]>([]);
  
  // Undo stack for deletions
  const undoStackRef = useRef<UndoAction[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  
  // Handle new connections
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      type: 'smoothstep',
      animated: false,
    }, eds));
    setIsDirty(true);
  }, [setEdges]);
  
  // Check if a position overlaps with existing nodes and find a clear spot
  const findNonOverlappingPosition = useCallback((
    initialPos: { x: number; y: number },
    existingNodes: BuilderNode[]
  ): { x: number; y: number } => {
    const nodeWidth = 280;
    const nodeHeight = 180;
    const minGap = 10; // Just prevent actual overlaps
    
    const overlaps = (testPos: { x: number; y: number }) => {
      return existingNodes.some((node) => {
        const nodeRight = node.position.x + nodeWidth;
        const nodeBottom = node.position.y + nodeHeight;
        const testRight = testPos.x + nodeWidth;
        const testBottom = testPos.y + nodeHeight;
        
        // Check if boxes overlap (with small buffer)
        const xOverlap = testPos.x < nodeRight + minGap && testRight > node.position.x - minGap;
        const yOverlap = testPos.y < nodeBottom + minGap && testBottom > node.position.y - minGap;
        
        return xOverlap && yOverlap;
      });
    };
    
    // If no overlap, return original position
    if (!overlaps(initialPos)) {
      return initialPos;
    }
    
    // Keep shifting right until we find a clear spot
    let pos = { ...initialPos };
    const shiftAmount = 300;
    let attempts = 0;
    
    while (overlaps(pos) && attempts < 20) {
      pos.x += shiftAmount;
      attempts++;
    }
    
    return pos;
  }, []);

  // Add a new node
  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    setNodes((nds) => {
      const adjustedPosition = findNonOverlappingPosition(position, nds);
      
      const newNode: BuilderNode = {
        id: generateNodeId(type),
        type,
        position: adjustedPosition,
        data: createDefaultNodeData(type),
      };
      
      setIsDirty(true);
      setSelectedNodeId(newNode.id);
      
      return [...nds, newNode];
    });
  }, [setNodes, findNonOverlappingPosition]);

  // Add a new node with an automatic connection from a source
  const addNodeWithConnection = useCallback((
    type: string,
    position: { x: number; y: number },
    sourceNodeId: string,
    sourceHandleId?: string | null
  ) => {
    const newNodeId = generateNodeId(type);
    
    // Center the node on the click position (offset by half the node width)
    const nodeWidth = 280;
    const centeredPosition = {
      x: position.x - nodeWidth / 2,
      y: position.y,
    };
    
    setNodes((nds) => {
      // Only adjust if directly overlapping, otherwise use the centered position
      const adjustedPosition = findNonOverlappingPosition(centeredPosition, nds);
      
      const newNode: BuilderNode = {
        id: newNodeId,
        type,
        position: adjustedPosition,
        data: createDefaultNodeData(type),
      };
      
      setSelectedNodeId(newNodeId);
      
      return [...nds, newNode];
    });

    // Create the edge connecting source to new node
    setEdges((eds) => {
      const newEdge: BuilderEdge = {
        id: `edge-${sourceNodeId}-${newNodeId}`,
        source: sourceNodeId,
        sourceHandle: sourceHandleId || undefined,
        target: newNodeId,
        type: 'smoothstep',
      };
      return [...eds, newEdge];
    });

    setIsDirty(true);
  }, [setNodes, setEdges, findNonOverlappingPosition]);
  
  // Update node data
  const updateNodeData = useCallback((nodeId: string, data: Partial<BuilderNodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    );
    setIsDirty(true);
  }, [setNodes]);
  
  // Delete a node (with undo support)
  const deleteNode = useCallback((nodeId: string) => {
    // Find the node and its connected edges before deleting
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    const edgesToDelete = edges.filter(e => e.source === nodeId || e.target === nodeId);
    
    if (nodeToDelete) {
      // Save to undo stack
      undoStackRef.current.push({
        type: 'delete-node',
        node: nodeToDelete,
        edges: edgesToDelete,
      });
      setCanUndo(true);
    }
    
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    setIsDirty(true);
  }, [nodes, edges, setNodes, setEdges, selectedNodeId]);
  
  // Delete an edge
  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    setIsDirty(true);
  }, [setEdges]);
  
  // Clear the canvas
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setMetadata({
      id: '',
      title: 'Untitled Story',
      author: '',
      description: '',
      version: '1.0',
    });
    setIsDirty(false);
    nodeIdCounter = 0;
    // Clear undo stack
    undoStackRef.current = [];
    setCanUndo(false);
  }, [setNodes, setEdges]);
  
  // Undo last deletion
  const undo = useCallback(() => {
    const action = undoStackRef.current.pop();
    if (!action) {
      setCanUndo(false);
      return;
    }
    
    if (action.type === 'delete-node' && action.node) {
      // Restore the node
      setNodes((nds) => [...nds, action.node!]);
      // Restore connected edges
      if (action.edges && action.edges.length > 0) {
        setEdges((eds) => [...eds, ...action.edges!]);
      }
      setSelectedNodeId(action.node.id);
    } else if (action.type === 'delete-edge' && action.edge) {
      setEdges((eds) => [...eds, action.edge!]);
    }
    
    setCanUndo(undoStackRef.current.length > 0);
    setIsDirty(true);
  }, [setNodes, setEdges]);
  
  // Keyboard shortcut for undo (Cmd/Ctrl+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        // Only handle if not in an input field
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        undo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);
  
  // Restore from saved draft
  const restoreDraft = useCallback((
    savedNodes: BuilderNode[],
    savedEdges: BuilderEdge[],
    savedMetadata: StoryMetadata
  ) => {
    setNodes(savedNodes);
    setEdges(savedEdges);
    setMetadata(savedMetadata);
    setSelectedNodeId(null);
    setIsDirty(false);
    
    // Update node counter to avoid ID collisions
    const maxId = savedNodes.reduce((max, node) => {
      const match = node.id.match(/-(\d+)-/);
      if (match) {
        return Math.max(max, parseInt(match[1], 10));
      }
      return max;
    }, 0);
    nodeIdCounter = maxId + 1;
  }, [setNodes, setEdges]);

  // Import a story from JSON
  const importStory = useCallback((story: Story) => {
    const newNodes: BuilderNode[] = [];
    const newEdges: BuilderEdge[] = [];
    const passageIdToNodeId: Record<string, string> = {};
    
    // Layout configuration
    const nodeWidth = 280;
    const horizontalGap = 60;
    const verticalGap = 40;
    const numColumns = 4;
    const startY = 200;
    
    // Estimate node height based on content
    const estimateNodeHeight = (passage: Passage, isEnding: boolean): number => {
      const baseHeight = 80; // Header + padding
      const textLines = Math.ceil((passage.text?.length || 0) / 40); // ~40 chars per line
      const textHeight = Math.min(textLines * 20, 80); // Cap text preview height
      
      if (isEnding) {
        return baseHeight + textHeight;
      }
      
      const choiceCount = passage.choices?.length || 1;
      const choicesHeight = choiceCount * 36; // Each choice row ~36px
      return baseHeight + textHeight + choicesHeight;
    };
    
    // Create a start node with initial state from the story
    const startNodeId = generateNodeId('start');
    const initialStateArray: StateVariable[] = story.initialState 
      ? Object.entries(story.initialState).map(([key, value]) => ({ key, value }))
      : [];
    
    newNodes.push({
      id: startNodeId,
      type: 'start',
      position: { x: 100, y: 50 },
      data: { label: 'Story Start', initialState: initialStateArray } as StartNodeData,
    });
    
    // Track column heights for smart placement
    const columnHeights: number[] = Array(numColumns).fill(startY);
    
    // Create nodes for each passage
    const passageEntries = Object.entries(story.passages);
    
    passageEntries.forEach(([passageId, passage]) => {
      const isEnding = !!passage.isEnding;
      const estimatedHeight = estimateNodeHeight(passage, isEnding);
      
      // Find the column with the smallest height (most space)
      let shortestColumn = 0;
      let shortestHeight = columnHeights[0];
      for (let i = 1; i < numColumns; i++) {
        if (columnHeights[i] < shortestHeight) {
          shortestHeight = columnHeights[i];
          shortestColumn = i;
        }
      }
      
      const position = {
        x: 100 + shortestColumn * (nodeWidth + horizontalGap),
        y: columnHeights[shortestColumn],
      };
      
      // Update column height
      columnHeights[shortestColumn] += estimatedHeight + verticalGap;
      
      const nodeId = generateNodeId(isEnding ? 'ending' : 'passage');
      passageIdToNodeId[passageId] = nodeId;
      
      if (isEnding) {
        newNodes.push({
          id: nodeId,
          type: 'ending',
          position,
          data: {
            passageId,
            text: passage.text,
            endingType: passage.endingType || 'neutral',
          } as EndingNodeData,
        });
      } else {
        const choices: BuilderChoice[] = (passage.choices || []).map((choice, idx) => {
          const builderChoice: BuilderChoice = {
            id: `choice-${Date.now()}-${idx}`,
            text: choice.text,
          };
          
          // Convert setState object to single key-value (take first entry)
          if (choice.setState && Object.keys(choice.setState).length > 0) {
            const [key, value] = Object.entries(choice.setState)[0];
            builderChoice.setState = { key, value };
          }
          
          // Convert condition object to single key-value (take first entry)
          if (choice.condition && Object.keys(choice.condition).length > 0) {
            const [key, value] = Object.entries(choice.condition)[0];
            builderChoice.condition = { key, value };
          }
          
          return builderChoice;
        });
        
        newNodes.push({
          id: nodeId,
          type: 'passage',
          position,
          data: {
            passageId,
            text: passage.text,
            choices: choices.length > 0 ? choices : [{ id: `choice-${Date.now()}`, text: 'Continue' }],
          } as PassageNodeData,
        });
      }
    });
    
    // Connect start node to the first passage
    if (story.start && passageIdToNodeId[story.start]) {
      newEdges.push({
        id: `edge-start-${story.start}`,
        source: startNodeId,
        target: passageIdToNodeId[story.start],
        type: 'smoothstep',
      });
    }
    
    // Create edges from choices to their target passages
    passageEntries.forEach(([passageId, passage]) => {
      if (passage.choices && !passage.isEnding) {
        const sourceNodeId = passageIdToNodeId[passageId];
        const sourceNode = newNodes.find(n => n.id === sourceNodeId);
        
        if (sourceNode && sourceNode.type === 'passage') {
          const nodeData = sourceNode.data as PassageNodeData;
          
          passage.choices.forEach((choice, idx) => {
            if (choice.goto && passageIdToNodeId[choice.goto]) {
              const choiceId = nodeData.choices[idx]?.id;
              if (choiceId) {
                newEdges.push({
                  id: `edge-${sourceNodeId}-${choice.goto}-${idx}`,
                  source: sourceNodeId,
                  sourceHandle: `choice-${choiceId}`,
                  target: passageIdToNodeId[choice.goto],
                  type: 'smoothstep',
                });
              }
            }
          });
        }
      }
    });
    
    // Update state
    setNodes(newNodes);
    setEdges(newEdges);
    setMetadata({
      id: story.id,
      title: story.title,
      author: story.author,
      description: story.description || '',
      version: story.version || '1.0',
    });
    setSelectedNodeId(null);
    setIsDirty(true);
    
    // Update node counter
    nodeIdCounter = newNodes.length + 1;
  }, [setNodes, setEdges]);
  
  const value: StoryBuilderContextState = {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNodeId,
    setSelectedNodeId,
    metadata,
    setMetadata,
    addNode,
    addNodeWithConnection,
    updateNodeData,
    deleteNode,
    deleteEdge,
    validationErrors,
    isDirty,
    setIsDirty,
    clearCanvas,
    restoreDraft,
    importStory,
    undo,
    canUndo,
  };
  
  return (
    <StoryBuilderContext.Provider value={value}>
      {children}
    </StoryBuilderContext.Provider>
  );
}

export function useStoryBuilderContext() {
  const context = useContext(StoryBuilderContext);
  if (!context) {
    throw new Error('useStoryBuilderContext must be used within a StoryBuilderProvider');
  }
  return context;
}

