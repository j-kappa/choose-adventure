/**
 * Story Format Type Definitions
 * 
 * These interfaces define the structure of .adventure.json story files.
 * See docs/story-format.md for full documentation.
 */

/**
 * Condition for showing/hiding a choice based on story state
 * Keys are state variable names, values are the required values
 */
export interface Condition {
  [key: string]: boolean | string | number;
}

/**
 * State changes to apply when a choice is selected
 */
export interface StateChange {
  [key: string]: boolean | string | number;
}

/**
 * A choice presented to the player at the end of a passage
 */
export interface Choice {
  /** The text displayed for this choice */
  text: string;
  /** The passage ID to navigate to */
  goto: string;
  /** Optional state changes when this choice is selected */
  setState?: StateChange;
  /** Optional condition - choice only shown if condition is met */
  condition?: Condition;
}

/**
 * A passage (node) in the story containing text and choices
 */
export interface Passage {
  /** The narrative text for this passage (supports multiple paragraphs) */
  text: string;
  /** Available choices at the end of this passage */
  choices?: Choice[];
  /** If true, this passage ends the story */
  isEnding?: boolean;
  /** Optional ending type for styling (e.g., "good", "bad", "neutral") */
  endingType?: 'good' | 'bad' | 'neutral';
}

/**
 * Collection of passages indexed by passage ID
 */
export interface Passages {
  [passageId: string]: Passage;
}

/**
 * Initial state for a story
 */
export interface StoryState {
  [key: string]: boolean | string | number;
}

/**
 * Complete story structure
 */
export interface Story {
  /** Unique identifier for the story */
  id: string;
  /** Display title */
  title: string;
  /** Author name */
  author: string;
  /** Short description for the library */
  description: string;
  /** Story format version */
  version: string;
  /** Optional cover image path */
  cover?: string;
  /** Initial state variables */
  initialState?: StoryState;
  /** ID of the starting passage */
  start: string;
  /** All passages in the story */
  passages: Passages;
}

/**
 * Story manifest entry for the library
 */
export interface StoryManifestEntry {
  id: string;
  title: string;
  author: string;
  description: string;
  cover?: string;
  file: string;
}

/**
 * Story manifest listing all available stories
 */
export interface StoryManifest {
  stories: StoryManifestEntry[];
}

/**
 * Player's current state during gameplay
 */
export interface PlayerState {
  /** Current passage ID */
  currentPassageId: string;
  /** Current state variables */
  state: StoryState;
  /** History of visited passage IDs */
  history: string[];
}

