import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';

export interface FontOption {
  id: string;
  name: string;
  family: string;
  type: 'serif' | 'sans';
}

export const FONT_OPTIONS: FontOption[] = [
  // Serif fonts
  { id: 'cormorant', name: 'Cormorant', family: "'Cormorant Garamond', Georgia, serif", type: 'serif' },
  { id: 'playfair', name: 'Playfair', family: "'Playfair Display', Georgia, serif", type: 'serif' },
  { id: 'lora', name: 'Lora', family: "'Lora', Georgia, serif", type: 'serif' },
  { id: 'merriweather', name: 'Merriweather', family: "'Merriweather', Georgia, serif", type: 'serif' },
  { id: 'crimson', name: 'Crimson Pro', family: "'Crimson Pro', Georgia, serif", type: 'serif' },
  // Sans-serif fonts
  { id: 'inter', name: 'Inter', family: "'Inter', system-ui, sans-serif", type: 'sans' },
  { id: 'source-sans', name: 'Source Sans', family: "'Source Sans 3', system-ui, sans-serif", type: 'sans' },
  { id: 'open-sans', name: 'Open Sans', family: "'Open Sans', system-ui, sans-serif", type: 'sans' },
];

interface FontFamilyContextType {
  currentFont: FontOption;
  setFont: (fontId: string) => void;
  fonts: FontOption[];
}

export const FontFamilyContext = createContext<FontFamilyContextType | undefined>(undefined);

const STORAGE_KEY = 'adventure-font-family';

function getInitialFont(): FontOption {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    const found = FONT_OPTIONS.find(f => f.id === stored);
    if (found) return found;
  }
  return FONT_OPTIONS[0]; // Default to Cormorant
}

interface FontFamilyProviderProps {
  children: ReactNode;
}

export function FontFamilyProvider({ children }: FontFamilyProviderProps) {
  const [currentFont, setCurrentFont] = useState<FontOption>(getInitialFont);

  // Apply font to CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--font-story', currentFont.family);
    localStorage.setItem(STORAGE_KEY, currentFont.id);
  }, [currentFont]);

  const setFont = useCallback((fontId: string) => {
    const font = FONT_OPTIONS.find(f => f.id === fontId);
    if (font) {
      setCurrentFont(font);
    }
  }, []);

  return (
    <FontFamilyContext.Provider value={{ currentFont, setFont, fonts: FONT_OPTIONS }}>
      {children}
    </FontFamilyContext.Provider>
  );
}

