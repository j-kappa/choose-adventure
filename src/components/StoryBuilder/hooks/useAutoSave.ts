import { useEffect, useRef, useCallback, useState } from 'react';
import { useStoryBuilderContext, type BuilderNode, type BuilderEdge, type StoryMetadata } from '../../../context/StoryBuilderContext';

const STORAGE_KEY = 'story-builder-draft';
const SAVE_DELAY = 1000; // 1 second debounce

export interface SavedDraft {
  nodes: BuilderNode[];
  edges: BuilderEdge[];
  metadata: StoryMetadata;
  savedAt: string;
}

interface UseAutoSaveReturn {
  pendingDraft: SavedDraft | null;
  clearPendingDraft: () => void;
  restorePendingDraft: () => void;
}

export function useAutoSave(): UseAutoSaveReturn {
  const { nodes, edges, metadata, isDirty, setIsDirty, restoreDraft, clearCanvas } = useStoryBuilderContext();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoadRef = useRef(true);
  const [pendingDraft, setPendingDraft] = useState<SavedDraft | null>(null);
  
  // Save to localStorage (debounced)
  const saveDraft = useCallback(() => {
    if (nodes.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    
    const draft: SavedDraft = {
      nodes,
      edges,
      metadata,
      savedAt: new Date().toISOString(),
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  }, [nodes, edges, metadata, setIsDirty]);
  
  // Auto-save on changes
  useEffect(() => {
    // Skip initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for save
    if (isDirty) {
      saveTimeoutRef.current = setTimeout(saveDraft, SAVE_DELAY);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, metadata, isDirty, saveDraft]);
  
  // Load draft on mount - set as pending for user to decide
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft: SavedDraft = JSON.parse(saved);
        // Only show prompt if draft has content
        if (draft.nodes && draft.nodes.length > 0) {
          setPendingDraft(draft);
        }
      }
    } catch (err) {
      console.error('Failed to load draft:', err);
    }
  }, []);
  
  // Clear pending draft (user chose not to restore) and clear the canvas
  const clearPendingDraft = useCallback(() => {
    setPendingDraft(null);
    localStorage.removeItem(STORAGE_KEY);
    clearCanvas();
  }, [clearCanvas]);
  
  // Restore pending draft
  const restorePendingDraft = useCallback(() => {
    if (pendingDraft) {
      restoreDraft(pendingDraft.nodes, pendingDraft.edges, pendingDraft.metadata);
      setPendingDraft(null);
    }
  }, [pendingDraft, restoreDraft]);
  
  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && nodes.length > 0) {
        saveDraft();
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, nodes.length, saveDraft]);
  
  return {
    pendingDraft,
    clearPendingDraft,
    restorePendingDraft,
  };
}

/**
 * Get saved draft info (for UI display)
 */
export function getSavedDraftInfo(): { exists: boolean; savedAt?: Date } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const draft: SavedDraft = JSON.parse(saved);
      return {
        exists: true,
        savedAt: new Date(draft.savedAt),
      };
    }
  } catch {
    // Ignore errors
  }
  return { exists: false };
}

/**
 * Clear saved draft
 */
export function clearSavedDraft() {
  localStorage.removeItem(STORAGE_KEY);
}

