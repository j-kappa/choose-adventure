import { useMemo } from 'react';
import { useStoryBuilderContext, type ValidationError, type PassageNodeData, type EndingNodeData } from '../../../context/StoryBuilderContext';

interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationError[];
  hasErrors: boolean;
}

export function useValidation(): ValidationResult {
  const { nodes, edges, metadata } = useStoryBuilderContext();
  
  return useMemo(() => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    // Check for start node
    const startNodes = nodes.filter(n => n.type === 'start');
    if (startNodes.length === 0) {
      errors.push({
        id: 'no-start',
        type: 'error',
        message: 'Story needs a Start node',
      });
    } else if (startNodes.length > 1) {
      errors.push({
        id: 'multiple-starts',
        type: 'error',
        message: 'Only one Start node allowed',
        nodeId: startNodes[1].id,
      });
    }
    
    // Check for at least one ending
    const endingNodes = nodes.filter(n => n.type === 'ending');
    if (endingNodes.length === 0 && nodes.length > 0) {
      errors.push({
        id: 'no-ending',
        type: 'error',
        message: 'Story needs at least one Ending node',
      });
    }
    
    // Check metadata
    if (!metadata.id.trim()) {
      warnings.push({
        id: 'no-story-id',
        type: 'warning',
        message: 'Story ID is not set',
      });
    }
    
    if (!metadata.author.trim()) {
      warnings.push({
        id: 'no-author',
        type: 'warning',
        message: 'Author name is not set',
      });
    }
    
    // Check each node
    nodes.forEach(node => {
      const nodeEdges = edges.filter(e => e.source === node.id);
      
      // Check if node has outgoing connections (except endings)
      if (node.type !== 'ending' && nodeEdges.length === 0) {
        errors.push({
          id: `disconnected-${node.id}`,
          type: 'error',
          message: `${node.type === 'start' ? 'Start' : 'Node'} has no outgoing connection`,
          nodeId: node.id,
        });
      }
      
      // Check passage-specific issues
      if (node.type === 'passage') {
        const data = node.data as PassageNodeData;
        
        if (!data.text.trim()) {
          warnings.push({
            id: `empty-passage-${node.id}`,
            type: 'warning',
            message: 'Passage has no text',
            nodeId: node.id,
          });
        }
        
        if (!data.passageId.trim()) {
          errors.push({
            id: `no-passage-id-${node.id}`,
            type: 'error',
            message: 'Passage ID is required',
            nodeId: node.id,
          });
        }
        
        // Check if all choices have connections
        data.choices.forEach((choice, index) => {
          const choiceEdge = edges.find(e => e.source === node.id && e.sourceHandle === `choice-${choice.id}`);
          if (!choiceEdge) {
            errors.push({
              id: `unconnected-choice-${node.id}-${index}`,
              type: 'error',
              message: `Choice ${index + 1} is not connected`,
              nodeId: node.id,
            });
          }
          
          if (!choice.text.trim()) {
            warnings.push({
              id: `empty-choice-${node.id}-${index}`,
              type: 'warning',
              message: `Choice ${index + 1} has no text`,
              nodeId: node.id,
            });
          }
        });
      }
      
      // Check ending-specific issues
      if (node.type === 'ending') {
        const data = node.data as EndingNodeData;
        
        if (!data.text.trim()) {
          warnings.push({
            id: `empty-ending-${node.id}`,
            type: 'warning',
            message: 'Ending has no text',
            nodeId: node.id,
          });
        }
        
        if (!data.passageId.trim()) {
          errors.push({
            id: `no-ending-id-${node.id}`,
            type: 'error',
            message: 'Ending ID is required',
            nodeId: node.id,
          });
        }
        
        // Check if ending has incoming connection
        const incomingEdges = edges.filter(e => e.target === node.id);
        if (incomingEdges.length === 0) {
          warnings.push({
            id: `unreachable-ending-${node.id}`,
            type: 'warning',
            message: 'Ending is not reachable',
            nodeId: node.id,
          });
        }
      }
    });
    
    // Check for duplicate passage IDs
    const passageIds = new Map<string, string[]>();
    nodes.forEach(node => {
      if (node.type === 'passage' || node.type === 'ending') {
        const data = node.data as PassageNodeData | EndingNodeData;
        if (data.passageId) {
          const existing = passageIds.get(data.passageId) || [];
          existing.push(node.id);
          passageIds.set(data.passageId, existing);
        }
      }
    });
    
    passageIds.forEach((nodeIds, passageId) => {
      if (nodeIds.length > 1) {
        errors.push({
          id: `duplicate-id-${passageId}`,
          type: 'error',
          message: `Duplicate passage ID: "${passageId}"`,
          nodeId: nodeIds[1],
        });
      }
    });
    
    // Check for orphan nodes (not reachable from start)
    if (startNodes.length > 0) {
      const reachable = new Set<string>();
      const queue = [startNodes[0].id];
      
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (reachable.has(currentId)) continue;
        reachable.add(currentId);
        
        const outgoing = edges.filter(e => e.source === currentId);
        outgoing.forEach(edge => {
          if (!reachable.has(edge.target)) {
            queue.push(edge.target);
          }
        });
      }
      
      nodes.forEach(node => {
        if (node.type !== 'start' && !reachable.has(node.id)) {
          warnings.push({
            id: `orphan-${node.id}`,
            type: 'warning',
            message: 'Node is not reachable from Start',
            nodeId: node.id,
          });
        }
      });
    }
    
    return {
      errors,
      warnings,
      hasErrors: errors.length > 0,
    };
  }, [nodes, edges, metadata]);
}

