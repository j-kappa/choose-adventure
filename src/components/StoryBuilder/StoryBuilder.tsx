import { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  useReactFlow,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BookOpen, Check, Monitor, ArrowLeft, Upload } from 'lucide-react';
import type { Story } from '../../types/story';
import { Link } from 'react-router-dom';

import { StoryBuilderProvider, useStoryBuilderContext, type BuilderNode, type BuilderEdge } from '../../context/StoryBuilderContext';
import { ValidationProvider } from '../../context/ValidationContext';
import { nodeTypes } from './nodes';
import { BuilderToolbar } from './toolbar/BuilderToolbar';
import { NodeMenu } from './toolbar/NodeMenu';
import { ExportDialog } from './toolbar/ExportDialog';
import { ImportDialog } from './toolbar/ImportDialog';
import { RestoreDialog } from './toolbar/RestoreDialog';
import { HelpDialog } from './toolbar/HelpDialog';
import { StoryPreview } from './preview';
import { PropertiesPanel } from './panels/PropertiesPanel';
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
    importStory,
    addNodeWithConnection,
    isDirty,
  } = useStoryBuilderContext();

  const { screenToFlowPosition, fitView } = useReactFlow();
  
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<PendingConnection | null>(null);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const wasDirtyRef = useRef(false);
  const dragCounterRef = useRef(0);
  
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
  // Track if a connection was just successfully made (to prevent showing menu)
  const connectionSucceededRef = useRef(false);
  
  // Validation
  const { errors, warnings, hasErrors } = useValidation();
  
  // Export
  const { storyJson, filename, story } = useExport();
  
  // Auto-save to localStorage
  const { pendingDraft, clearPendingDraft, restorePendingDraft } = useAutoSave();
  
  // Track if we just showed the connection menu to prevent pane click from closing it
  const justShowedMenuRef = useRef(false);

  // Wrap onConnect to track successful connections
  const handleConnect = useCallback((params: Parameters<typeof onConnect>[0]) => {
    connectionSucceededRef.current = true;
    onConnect(params);
  }, [onConnect]);

  const onPaneClick = useCallback(() => {
    // Don't close menu if we just showed it (from connection drop)
    if (!justShowedMenuRef.current) {
      setPendingConnection(null);
    }
    justShowedMenuRef.current = false;
  }, []);

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
    
    // If a connection was just made successfully, don't show the menu
    if (connectionSucceededRef.current) {
      connectionSucceededRef.current = false;
      return;
    }
    
    // Check if we have a source node
    if (!sourceNodeId) {
      return;
    }

    // Get the target element to check if we dropped on empty space
    const targetElement = (event as MouseEvent).target as HTMLElement;
    
    // Don't show menu if dropped on a node or handle (backup check)
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
  
  // Handle file drag and drop for importing stories
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    
    // Check if dragging files
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingFile(true);
    }
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    
    if (dragCounterRef.current === 0) {
      setIsDraggingFile(false);
    }
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDraggingFile(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    // Check if it's a JSON file
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      alert('Please drop a .json file');
      return;
    }
    
    // Read and parse the file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const story = JSON.parse(content) as Story;
        
        // Basic validation
        if (!story.id || !story.title || !story.passages || !story.start) {
          alert('Invalid story format. Missing required fields (id, title, passages, start).');
          return;
        }
        
        if (!story.passages[story.start]) {
          alert(`Start passage "${story.start}" not found in passages.`);
          return;
        }
        
        // Confirm import if there are existing nodes
        if (nodes.length > 0) {
          if (!confirm('This will replace your current story. Continue?')) {
            return;
          }
        }
        
        importStory(story);
      } catch (err) {
        alert('Failed to parse story file. Please check the JSON format.');
      }
    };
    
    reader.onerror = () => {
      alert('Failed to read file.');
    };
    
    reader.readAsText(file);
  }, [importStory, nodes.length]);
  
  // Update selectedNodeId when node selection changes in React Flow
  useEffect(() => {
    const selectedNodes = nodes.filter(n => n.selected);
    if (selectedNodes.length === 1) {
      setSelectedNodeId(selectedNodes[0].id);
    } else if (selectedNodes.length === 0) {
      setSelectedNodeId(null);
    }
    // Keep current selectedNodeId if multiple nodes selected
  }, [nodes, setSelectedNodeId]);
  
  return (
    <div className={styles.container}>
      <BuilderToolbar 
        onExport={() => setShowExportDialog(true)}
        onImport={() => setShowImportDialog(true)}
        onTest={() => setShowPreview(true)}
        onHelp={() => setShowHelpDialog(true)}
        hasErrors={hasErrors}
        canTest={!hasErrors && !!story}
        errors={errors}
        warnings={warnings}
      />
      
      <div className={styles.main}>
        <div 
          className={styles.canvasWrapper}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isDraggingFile && (
            <div className={styles.dropOverlay}>
              <div className={styles.dropOverlayContent}>
                <Upload size={24} strokeWidth={1.5} />
                <p>Drop to import</p>
              </div>
            </div>
          )}
          <ReactFlow<BuilderNode, BuilderEdge>
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
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
            selectionOnDrag
            selectionMode={SelectionMode.Partial}
            panOnDrag={[1, 2]}
            selectNodesOnDrag={false}
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
                Click a node type below to add it to the canvas, then connect nodes to create your adventure.
              </p>
            </div>
          )}
          
          {showSavedIndicator && (
            <div className={styles.savedIndicator}>
              <Check size={12} />
              Saved
            </div>
          )}
          
          <NodeMenu />
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
      
      <HelpDialog
        isOpen={showHelpDialog}
        onClose={() => setShowHelpDialog(false)}
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

function MobileWarning() {
  return (
    <div className={styles.mobileWarning}>
      <div className={styles.mobileWarningContent}>
        <div className={styles.mobileWarningIcon}>
          <Monitor size={32} />
        </div>
        <h2 className={styles.mobileWarningTitle}>Desktop Required</h2>
        <p className={styles.mobileWarningText}>
          The Story Builder needs a desktop with mouse and keyboard.
        </p>
        <Link to="/" className={styles.mobileWarningButton}>
          <ArrowLeft size={16} />
          Back to Library
        </Link>
      </div>
    </div>
  );
}

export function StoryBuilder() {
  return (
    <>
      <MobileWarning />
      <ReactFlowProvider>
        <StoryBuilderProvider>
          <ValidationProvider>
            <StoryBuilderContent />
          </ValidationProvider>
        </StoryBuilderProvider>
      </ReactFlowProvider>
    </>
  );
}

