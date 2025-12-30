import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';

type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface FontSizeContextType {
  fontSize: FontSize;
  increase: () => void;
  decrease: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
}

export const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const STORAGE_KEY = 'adventure-font-size';
const SIZES: FontSize[] = ['small', 'medium', 'large', 'xlarge'];

const SIZE_VALUES: Record<FontSize, { story: string; storyMobile: string }> = {
  small: { story: '1.125rem', storyMobile: '1rem' },
  medium: { story: '1.375rem', storyMobile: '1.125rem' },
  large: { story: '1.625rem', storyMobile: '1.25rem' },
  xlarge: { story: '1.875rem', storyMobile: '1.5rem' },
};

function getInitialFontSize(): FontSize {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SIZES.includes(stored as FontSize)) {
      return stored as FontSize;
    }
  }
  return 'medium';
}

interface FontSizeProviderProps {
  children: ReactNode;
}

export function FontSizeProvider({ children }: FontSizeProviderProps) {
  const [fontSize, setFontSize] = useState<FontSize>(getInitialFontSize);

  // Apply font size to CSS variables
  useEffect(() => {
    const values = SIZE_VALUES[fontSize];
    document.documentElement.style.setProperty('--text-story', values.story);
    document.documentElement.style.setProperty('--text-story-mobile', values.storyMobile);
    localStorage.setItem(STORAGE_KEY, fontSize);
  }, [fontSize]);

  const currentIndex = SIZES.indexOf(fontSize);
  const canIncrease = currentIndex < SIZES.length - 1;
  const canDecrease = currentIndex > 0;

  const increase = useCallback(() => {
    if (canIncrease) {
      setFontSize(SIZES[currentIndex + 1]);
    }
  }, [currentIndex, canIncrease]);

  const decrease = useCallback(() => {
    if (canDecrease) {
      setFontSize(SIZES[currentIndex - 1]);
    }
  }, [currentIndex, canDecrease]);

  return (
    <FontSizeContext.Provider value={{ fontSize, increase, decrease, canIncrease, canDecrease }}>
      {children}
    </FontSizeContext.Provider>
  );
}

