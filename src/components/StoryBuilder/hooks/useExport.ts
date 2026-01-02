import { useMemo } from 'react';
import { useStoryBuilderContext, type PassageNodeData, type EndingNodeData, type StateNodeData, type ConditionNodeData, type StartNodeData } from '../../../context/StoryBuilderContext';
import type { Story, Passage, Choice, StateChange, Condition } from '../../../types/story';

interface ExportResult {
  storyJson: string;
  filename: string;
  story: Story | null;
}

export function useExport(): ExportResult {
  const { nodes, edges, metadata } = useStoryBuilderContext();
  
  return useMemo(() => {
    if (nodes.length === 0) {
      return { storyJson: '{}', filename: 'story', story: null };
    }
    
    const startNode = nodes.find(n => n.type === 'start');
    if (!startNode) {
      return { storyJson: '{}', filename: 'story', story: null };
    }
    
    // Find what the start node connects to
    const startEdge = edges.find(e => e.source === startNode.id);
    const firstPassageNodeId = startEdge?.target;
    
    // Build passages object
    const passages: Record<string, Passage> = {};
    
    // Process passage and ending nodes
    nodes.forEach(node => {
      if (node.type === 'passage') {
        const data = node.data as PassageNodeData;
        const passageId = data.passageId || node.id;
        
        // Build choices with their connections
        const choices: Choice[] = data.choices.map(choice => {
          const choiceEdge = edges.find(e => 
            e.source === node.id && 
            e.sourceHandle === `choice-${choice.id}`
          );
          
          // Resolve the target - might go through state/condition nodes
          const resolvedTarget = resolveTarget(choiceEdge?.target, nodes, edges);
          
          const choiceObj: Choice = {
            text: choice.text || 'Continue',
            goto: resolvedTarget.passageId,
          };
          
          // Add state changes from choice-level setState (takes precedence)
          if (choice.setState?.key) {
            choiceObj.setState = { [choice.setState.key]: choice.setState.value };
          }
          // Merge with state changes from state nodes in the path
          if (resolvedTarget.stateChanges && Object.keys(resolvedTarget.stateChanges).length > 0) {
            choiceObj.setState = { ...resolvedTarget.stateChanges, ...choiceObj.setState };
          }
          
          // Add conditions from choice-level condition (takes precedence)
          if (choice.condition?.key) {
            choiceObj.condition = { [choice.condition.key]: choice.condition.value };
          }
          // Merge with conditions from condition nodes in the path
          if (resolvedTarget.conditions && Object.keys(resolvedTarget.conditions).length > 0) {
            choiceObj.condition = { ...resolvedTarget.conditions, ...choiceObj.condition };
          }
          
          return choiceObj;
        }).filter(c => c.goto);
        
        passages[passageId] = {
          text: data.text || '',
          choices: choices.length > 0 ? choices : undefined,
        };
      } else if (node.type === 'ending') {
        const data = node.data as EndingNodeData;
        const passageId = data.passageId || node.id;
        
        passages[passageId] = {
          text: data.text || '',
          isEnding: true,
          endingType: data.endingType,
        };
      }
    });
    
    // Find first passage ID
    let startPassageId = 'start';
    if (firstPassageNodeId) {
      const firstNode = nodes.find(n => n.id === firstPassageNodeId);
      if (firstNode?.type === 'passage') {
        startPassageId = (firstNode.data as PassageNodeData).passageId || firstNode.id;
      } else if (firstNode?.type === 'state' || firstNode?.type === 'condition') {
        // Resolve through intermediate nodes
        const resolved = resolveTarget(firstPassageNodeId, nodes, edges);
        startPassageId = resolved.passageId;
      }
    }
    
    // Build initial state from the Start node
    const initialState: Record<string, boolean | string | number> = {};
    if (startNode) {
      const startData = startNode.data as StartNodeData;
      if (startData.initialState && startData.initialState.length > 0) {
        startData.initialState.forEach(variable => {
          if (variable.key) {
            initialState[variable.key] = variable.value;
          }
        });
      }
    }
    
    const story: Story = {
      id: metadata.id || generateStoryId(metadata.title),
      title: metadata.title || 'Untitled Story',
      author: metadata.author || 'Anonymous',
      description: metadata.description || '',
      version: metadata.version || '1.0',
      ...(Object.keys(initialState).length > 0 ? { initialState } : {}),
      start: startPassageId,
      passages,
    };
    
    const filename = story.id || 'story';
    const storyJson = JSON.stringify(story, null, 2);
    
    return { storyJson, filename, story };
  }, [nodes, edges, metadata]);
}

/**
 * Resolve target node ID to passage ID, following through state/condition nodes
 */
function resolveTarget(
  targetNodeId: string | undefined,
  nodes: ReturnType<typeof useStoryBuilderContext>['nodes'],
  edges: ReturnType<typeof useStoryBuilderContext>['edges']
): { passageId: string; stateChanges?: StateChange; conditions?: Condition } {
  if (!targetNodeId) {
    return { passageId: '' };
  }
  
  const targetNode = nodes.find(n => n.id === targetNodeId);
  if (!targetNode) {
    return { passageId: '' };
  }
  
  // If it's a passage or ending, return directly
  if (targetNode.type === 'passage') {
    return { passageId: (targetNode.data as PassageNodeData).passageId || targetNode.id };
  }
  
  if (targetNode.type === 'ending') {
    return { passageId: (targetNode.data as EndingNodeData).passageId || targetNode.id };
  }
  
  // If it's a state node, collect state changes and continue
  if (targetNode.type === 'state') {
    const data = targetNode.data as StateNodeData;
    const stateChanges: StateChange = {};
    data.stateChanges.forEach(change => {
      if (change.key) {
        stateChanges[change.key] = change.value;
      }
    });
    
    // Find outgoing edge and continue resolution
    const outEdge = edges.find(e => e.source === targetNode.id);
    if (outEdge) {
      const resolved = resolveTarget(outEdge.target, nodes, edges);
      return {
        passageId: resolved.passageId,
        stateChanges: { ...stateChanges, ...resolved.stateChanges },
        conditions: resolved.conditions,
      };
    }
    
    return { passageId: '', stateChanges };
  }
  
  // If it's a condition node, we need to handle it differently
  // For now, just follow the "true" path
  if (targetNode.type === 'condition') {
    const data = targetNode.data as ConditionNodeData;
    const conditions: Condition = {};
    data.conditions.forEach(cond => {
      if (cond.key) {
        // For simple conditions, just use equality
        conditions[cond.key] = cond.value;
      }
    });
    
    // Find the "true" outgoing edge
    const trueEdge = edges.find(e => e.source === targetNode.id && e.sourceHandle === 'true');
    if (trueEdge) {
      const resolved = resolveTarget(trueEdge.target, nodes, edges);
      return {
        passageId: resolved.passageId,
        stateChanges: resolved.stateChanges,
        conditions: { ...conditions, ...resolved.conditions },
      };
    }
    
    return { passageId: '', conditions };
  }
  
  return { passageId: '' };
}

/**
 * Generate a story ID from the title
 */
function generateStoryId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50) || 'untitled-story';
}

