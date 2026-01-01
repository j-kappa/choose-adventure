import { createContext, useContext, type ReactNode } from 'react';
import { useValidation } from '../components/StoryBuilder/hooks/useValidation';

interface ValidationContextState {
  getNodeStatus: (nodeId: string) => { hasError: boolean; hasWarning: boolean };
}

const ValidationContext = createContext<ValidationContextState | null>(null);

interface ValidationProviderProps {
  children: ReactNode;
}

export function ValidationProvider({ children }: ValidationProviderProps) {
  const { errors, warnings } = useValidation();
  
  const getNodeStatus = (nodeId: string) => {
    const hasError = errors.some(e => e.nodeId === nodeId);
    const hasWarning = warnings.some(w => w.nodeId === nodeId);
    return { hasError, hasWarning };
  };
  
  return (
    <ValidationContext.Provider value={{ getNodeStatus }}>
      {children}
    </ValidationContext.Provider>
  );
}

export function useNodeValidation(nodeId: string) {
  const context = useContext(ValidationContext);
  if (!context) {
    return { hasError: false, hasWarning: false };
  }
  return context.getNodeStatus(nodeId);
}

