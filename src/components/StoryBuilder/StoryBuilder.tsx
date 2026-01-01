import { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  useReactFlow,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BookOpen, Check } from 'lucide-react';

import { StoryBuilderProvider, useStoryBuilderContext, type BuilderNode, type BuilderEdge } from '../../context/StoryBuilderContext';
import { ValidationProvider } from '../../context/ValidationContext';
import { nodeTypes } from './nodes';
import { BuilderToolbar } from './toolbar/BuilderToolbar';
import { ExportDialog } from './toolbar/ExportDialog';
import { ImportDialog } from './toolbar/ImportDialog';
import { RestoreDialog } from './toolbar/RestoreDialog';
import { StoryPreview } from './preview';
import { PropertiesPanel } from './panels/PropertiesPanel';
import { ValidationIndicator } from './panels/ValidationIndicator';
import { ConnectionMenu } from './panels/ConnectionMenu';
import { useValidation } from './hooks/useValidation';
import { useExport } from './hooks/useExport';
import { useAutoSave } from './hooks/useAutoSave';
import styles from './StoryBuilder.module.css';

// Track connection start info
interface PendingConnection {
  sourceNodeId: string;
  sourceHandleId: string | null;
  screenPosition: { x: number; y: number };
  flowPosition: { x: number; y: number };
}

function StoryBuilderContent() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    selectedNodeId,
    importStory,
    addNodeWithConnection,
    isDirty,
  } = useStoryBuilderContext();

  const { screenToFlowPosition, fitView } = useReactFlow();
  
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<PendingConnection | null>(null);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const wasDirtyRef = useRef(false);
  
  // Show saved indicator when isDirty changes from true to false
  useEffect(() => {
    if (wasDirtyRef.current && !isDirty && nodes.length > 0) {
      setShowSavedIndicator(true);
      const timer = setTimeout(() => setShowSavedIndicator(false), 2000);
      return () => clearTimeout(timer);
    }
    wasDirtyRef.current = isDirty;
  }, [isDirty, nodes.length]);
  
  // Track the connection source during drag
  const connectingNodeId = useRef<string | null>(null);
  const connectingHandleId = useRef<string | null>(null);
  
  // Validation
  const { errors, warnings, hasErrors } = useValidation();
  
  // Export
  const { storyJson, filename, story } = useExport();
  
  // Auto-save to localStorage
  const { pendingDraft, clearPendingDraft, restorePendingDraft } = useAutoSave();
  
  // Handle node selection
  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);
  
  // Track if we just showed the connection menu to prevent pane click from closing it
  const justShowedMenuRef = useRef(false);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    // Don't close menu if we just showed it (from connection drop)
    if (!justShowedMenuRef.current) {
      setPendingConnection(null);
    }
    justShowedMenuRef.current = false;
  }, [setSelectedNodeId]);

  // Track when a connection starts - React Flow v12 passes (event, { nodeId, handleId, handleType })
  const onConnectStart = useCallback((
    _event: MouseEvent | TouchEvent,
    params: { nodeId: string | null; handleId: string | null; handleType: string | null }
  ) => {
    connectingNodeId.current = params.nodeId;
    connectingHandleId.current = params.handleId;
  }, []);

  // Handle when a connection ends (either connected or dropped)
  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
    // Check if we have a source node
    const sourceNodeId = connectingNodeId.current;
    const sourceHandleId = connectingHandleId.current;
    
    // Reset refs first
    connectingNodeId.current = null;
    connectingHandleId.current = null;
    
    // Check if we have a source node
    if (!sourceNodeId) {
      return;
    }

    // Get the target element to check if we dropped on empty space
    const targetElement = (event as MouseEvent).target as HTMLElement;
    
    // Don't show menu if dropped on a node or handle (successful connection)
    if (targetElement?.closest('.react-flow__node') || 
        targetElement?.closest('.react-flow__handle') ||
        targetElement?.classList?.contains('react-flow__handle')) {
      return;
    }

    // Get mouse position - handle both mouse and touch events
    let clientX: number, clientY: number;
    
    if ('clientX' in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('changedTouches' in event && (event as TouchEvent).changedTouches.length > 0) {
      clientX = (event as TouchEvent).changedTouches[0].clientX;
      clientY = (event as TouchEvent).changedTouches[0].clientY;
    } else {
      return;
    }
    
    const screenPos = { x: clientX, y: clientY };
    const flowPos = screenToFlowPosition(screenPos);
    
    // Mark that we just showed the menu to prevent onPaneClick from closing it
    justShowedMenuRef.current = true;
    
    setPendingConnection({
      sourceNodeId,
      sourceHandleId,
      screenPosition: screenPos,
      flowPosition: flowPos,
    });
  }, [screenToFlowPosition]);

  // Handle node type selection from connection menu
  const handleConnectionMenuSelect = useCallback((nodeType: string) => {
    if (!pendingConnection) return;
    
    addNodeWithConnection(
      nodeType,
      pendingConnection.flowPosition,
      pendingConnection.sourceNodeId,
      pendingConnection.sourceHandleId
    );
    
    setPendingConnection(null);
  }, [pendingConnection, addNodeWithConnection]);

  const handleConnectionMenuClose = useCallback(() => {
    setPendingConnection(null);
  }, []);
  
  // Memoize selected nodes for React Flow
  const nodesWithSelection = useMemo((): BuilderNode[] => {
    return nodes.map(node => ({
      ...node,
      selected: node.id === selectedNodeId,
    }));
  }, [nodes, selectedNodeId]);
  
  return (
    <div className={styles.container}>
      <BuilderToolbar 
        onExport={() => setShowExportDialog(true)}
        onImport={() => setShowImportDialog(true)}
        onTest={() => setShowPreview(true)}
        hasErrors={hasErrors}
        canTest={!hasErrors && !!story}
      />
      
      <div className={styles.main}>
        <div className={styles.canvasWrapper}>
          <ReactFlow<BuilderNode, BuilderEdge>
            nodes={nodesWithSelection}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            className={styles.canvas}
            deleteKeyCode={['Backspace', 'Delete']}
            minZoom={0.2}
            maxZoom={2}
            panOnScroll
            panOnScrollSpeed={1}
            zoomOnPinch
            zoomOnScroll={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={15} size={1} color="rgba(255, 255, 255, 0.2)" />
            <MiniMap 
              nodeStrokeWidth={2}
              pannable={false}
              zoomable={false}
              className={styles.minimap}
              maskColor="rgba(30, 30, 30, 0.4)"
              style={{ width: 120, height: 80 }}
              onClick={() => fitView({ padding: 0.2, duration: 300 })}
              nodeColor={(node) => {
                switch (node.type) {
                  case 'start': return '#22c55e';
                  case 'passage': return '#3b82f6';
                  case 'ending': return '#6b7280';
                  case 'state': return '#a855f7';
                  case 'condition': return '#f97316';
                  default: return '#666';
                }
              }}
            />
          </ReactFlow>
          
          {nodes.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <BookOpen size={48} />
              </div>
              <h2 className={styles.emptyStateTitle}>Start Building Your Story</h2>
              <p className={styles.emptyStateText}>
                Click a node type above to add it to the canvas, then connect nodes to create your adventure.
              </p>
            </div>
          )}
          
          <ValidationIndicator errors={errors} warnings={warnings} />
          
          {showSavedIndicator && (
            <div className={styles.savedIndicator}>
              <Check size={12} />
              Saved
            </div>
          )}
        </div>
        
        <div className={styles.sidePanel}>
          <PropertiesPanel />
        </div>
      </div>
      
      {pendingConnection && (
        <ConnectionMenu
          position={pendingConnection.screenPosition}
          onSelect={handleConnectionMenuSelect}
          onClose={handleConnectionMenuClose}
        />
      )}
      
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        storyJson={storyJson}
        filename={filename}
      />
      
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={importStory}
      />
      
      {pendingDraft && (
        <RestoreDialog
          draft={pendingDraft}
          onRestore={restorePendingDraft}
          onDiscard={clearPendingDraft}
        />
      )}
      
      {showPreview && story && (
        <StoryPreview
          story={story}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

export function StoryBuilder() {
  return (
    <ReactFlowProvider>
      <StoryBuilderProvider>
        <ValidationProvider>
          <StoryBuilderContent />
        </ValidationProvider>
      </StoryBuilderProvider>
    </ReactFlowProvider>
  );
}

