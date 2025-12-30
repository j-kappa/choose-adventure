import type { Story, StoryManifest, StoryManifestEntry } from '../types/story';

const STORIES_PATH = '/stories';
const MANIFEST_FILE = 'manifest.json';

/**
 * Fetches the story manifest listing all available stories
 */
export async function fetchManifest(): Promise<StoryManifest> {
  const response = await fetch(`${STORIES_PATH}/${MANIFEST_FILE}`);
  
  if (!response.ok) {
    throw new Error(`Failed to load story manifest: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetches a single story by its ID
 */
export async function fetchStory(storyId: string): Promise<Story> {
  // First get the manifest to find the story file
  const manifest = await fetchManifest();
  const entry = manifest.stories.find(s => s.id === storyId);
  
  if (!entry) {
    throw new Error(`Story not found: ${storyId}`);
  }
  
  return fetchStoryByFile(entry.file);
}

/**
 * Fetches a story by its file path
 */
export async function fetchStoryByFile(filename: string): Promise<Story> {
  const response = await fetch(`${STORIES_PATH}/${filename}`);
  
  if (!response.ok) {
    throw new Error(`Failed to load story: ${response.statusText}`);
  }
  
  const story: Story = await response.json();
  
  // Validate story structure
  validateStory(story);
  
  return story;
}

/**
 * Gets all available stories from the manifest
 */
export async function getAvailableStories(): Promise<StoryManifestEntry[]> {
  const manifest = await fetchManifest();
  return manifest.stories;
}

/**
 * Basic validation of story structure
 */
function validateStory(story: Story): void {
  if (!story.id) {
    throw new Error('Story must have an id');
  }
  
  if (!story.title) {
    throw new Error('Story must have a title');
  }
  
  if (!story.start) {
    throw new Error('Story must have a start passage');
  }
  
  if (!story.passages) {
    throw new Error('Story must have passages');
  }
  
  if (!story.passages[story.start]) {
    throw new Error(`Start passage "${story.start}" not found in passages`);
  }
  
  // Validate all passage references
  for (const [passageId, passage] of Object.entries(story.passages)) {
    if (passage.choices) {
      for (const choice of passage.choices) {
        if (!story.passages[choice.goto]) {
          console.warn(
            `Warning: Choice in passage "${passageId}" references non-existent passage "${choice.goto}"`
          );
        }
      }
    }
  }
}

/**
 * Counts the total number of passages in a story
 */
export function countPassages(story: Story): number {
  return Object.keys(story.passages).length;
}

/**
 * Finds all ending passages in a story
 */
export function findEndings(story: Story): string[] {
  return Object.entries(story.passages)
    .filter(([, passage]) => passage.isEnding)
    .map(([id]) => id);
}

