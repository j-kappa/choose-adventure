import { createContext, useCallback, useReducer, type ReactNode } from 'react';
import type { Story, StoryState, Choice, Condition } from '../types/story';

// Action types
type StoryAction =
  | { type: 'LOAD_STORY'; payload: Story }
  | { type: 'NAVIGATE'; payload: { passageId: string; stateChanges?: StoryState } }
  | { type: 'GO_BACK' }
  | { type: 'RESTART' }
  | { type: 'RESET' };

// State shape
interface StoryContextState {
  story: Story | null;
  currentPassageId: string | null;
  playerState: StoryState;
  history: string[];
  isLoaded: boolean;
}

// Context value
interface StoryContextValue extends StoryContextState {
  loadStory: (story: Story) => void;
  makeChoice: (choice: Choice) => void;
  goBack: () => void;
  restart: () => void;
  reset: () => void;
  canGoBack: boolean;
  checkCondition: (condition: Condition) => boolean;
  getAvailableChoices: () => Choice[];
  currentPassage: Story['passages'][string] | null;
  isEnding: boolean;
}

export const StoryContext = createContext<StoryContextValue | undefined>(undefined);

// Initial state
const initialState: StoryContextState = {
  story: null,
  currentPassageId: null,
  playerState: {},
  history: [],
  isLoaded: false,
};

// Reducer
function storyReducer(state: StoryContextState, action: StoryAction): StoryContextState {
  switch (action.type) {
    case 'LOAD_STORY': {
      const story = action.payload;
      return {
        story,
        currentPassageId: story.start,
        playerState: { ...story.initialState },
        history: [],
        isLoaded: true,
      };
    }

    case 'NAVIGATE': {
      const { passageId, stateChanges } = action.payload;
      return {
        ...state,
        currentPassageId: passageId,
        playerState: stateChanges 
          ? { ...state.playerState, ...stateChanges }
          : state.playerState,
        history: state.currentPassageId 
          ? [...state.history, state.currentPassageId]
          : state.history,
      };
    }

    case 'GO_BACK': {
      if (state.history.length === 0) return state;
      const newHistory = [...state.history];
      const previousPassageId = newHistory.pop()!;
      return {
        ...state,
        currentPassageId: previousPassageId,
        history: newHistory,
        // Note: We don't undo state changes for simplicity
      };
    }

    case 'RESTART': {
      if (!state.story) return state;
      return {
        ...state,
        currentPassageId: state.story.start,
        playerState: { ...state.story.initialState },
        history: [],
      };
    }

    case 'RESET': {
      return initialState;
    }

    default:
      return state;
  }
}

interface StoryProviderProps {
  children: ReactNode;
}

export function StoryProvider({ children }: StoryProviderProps) {
  const [state, dispatch] = useReducer(storyReducer, initialState);

  const loadStory = useCallback((story: Story) => {
    dispatch({ type: 'LOAD_STORY', payload: story });
  }, []);

  const checkCondition = useCallback((condition: Condition): boolean => {
    return Object.entries(condition).every(([key, value]) => {
      return state.playerState[key] === value;
    });
  }, [state.playerState]);

  const makeChoice = useCallback((choice: Choice) => {
    dispatch({
      type: 'NAVIGATE',
      payload: {
        passageId: choice.goto,
        stateChanges: choice.setState,
      },
    });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const getAvailableChoices = useCallback((): Choice[] => {
    if (!state.story || !state.currentPassageId) return [];
    
    const passage = state.story.passages[state.currentPassageId];
    if (!passage?.choices) return [];

    return passage.choices.filter(choice => {
      if (!choice.condition) return true;
      return checkCondition(choice.condition);
    });
  }, [state.story, state.currentPassageId, checkCondition]);

  const currentPassage = state.story && state.currentPassageId
    ? state.story.passages[state.currentPassageId]
    : null;

  const isEnding = currentPassage?.isEnding ?? false;

  const value: StoryContextValue = {
    ...state,
    loadStory,
    makeChoice,
    goBack,
    restart,
    reset,
    canGoBack: state.history.length > 0,
    checkCondition,
    getAvailableChoices,
    currentPassage,
    isEnding,
  };

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
}

