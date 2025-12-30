import { useContext } from 'react';
import { FontSizeContext } from '../context/FontSizeContext';

export function useFontSize() {
  const context = useContext(FontSizeContext);
  
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  
  return context;
}

