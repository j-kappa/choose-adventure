import { useContext } from 'react';
import { FontFamilyContext } from '../context/FontFamilyContext';

export function useFontFamily() {
  const context = useContext(FontFamilyContext);
  
  if (context === undefined) {
    throw new Error('useFontFamily must be used within a FontFamilyProvider');
  }
  
  return context;
}

