# Adventure Story Format Specification

This document describes the JSON format used to create interactive stories for the Choose Your Adventure engine.

## Overview

Stories are written in JSON files with the `.adventure.json` extension and placed in the `public/stories/` directory. Each story is a self-contained document with metadata, state configuration, and passages.

## Quick Start

Here's a minimal story:

```json
{
  "id": "my-first-story",
  "title": "My First Story",
  "author": "Your Name",
  "description": "A short adventure to get started.",
  "version": "1.0",
  "start": "intro",
  "passages": {
    "intro": {
      "text": "You stand at a crossroads. Which path will you take?",
      "choices": [
        {
          "text": "Take the left path",
          "goto": "left_path"
        },
        {
          "text": "Take the right path",
          "goto": "right_path"
        }
      ]
    },
    "left_path": {
      "text": "The left path leads you to a peaceful meadow. You win!",
      "isEnding": true,
      "endingType": "good"
    },
    "right_path": {
      "text": "The right path leads to a dragon's lair. You are eaten.",
      "isEnding": true,
      "endingType": "bad"
    }
  }
}
```

## File Structure

### Story Metadata

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (lowercase, hyphenated) |
| `title` | string | Yes | Display title |
| `author` | string | Yes | Author's name |
| `description` | string | Yes | Short description for the library |
| `version` | string | Yes | Story version (e.g., "1.0") |
| `cover` | string | No | Path to cover image |
| `initialState` | object | No | Initial state variables |
| `start` | string | Yes | ID of the starting passage |
| `passages` | object | Yes | Map of passage IDs to passage objects |

### Passages

Passages are the building blocks of your story. Each passage has a unique ID (the object key) and contains text and optional choices.

```json
{
  "passage_id": {
    "text": "The narrative text. Supports multiple paragraphs.\n\nJust use double newlines to separate them.",
    "choices": [...],
    "isEnding": false,
    "endingType": "good"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | The narrative text (supports `\n\n` for paragraphs) |
| `choices` | array | No | Available choices (omit for endings) |
| `isEnding` | boolean | No | Marks this passage as an ending |
| `endingType` | string | No | One of: `"good"`, `"bad"`, `"neutral"` |

### Choices

Choices navigate the player between passages and can modify state.

```json
{
  "text": "Open the mysterious door",
  "goto": "behind_the_door",
  "setState": { "openedDoor": true },
  "condition": { "hasKey": true }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | Text displayed for this choice |
| `goto` | string | Yes | ID of the passage to navigate to |
| `setState` | object | No | State changes to apply |
| `condition` | object | No | Required state for choice to appear |

## State System

The state system allows you to track player progress and make choices conditional.

### Initial State

Define starting values in `initialState`:

```json
{
  "initialState": {
    "hasKey": false,
    "health": 100,
    "playerName": "Hero"
  }
}
```

Supported types:
- `boolean` - true/false flags
- `number` - numeric values
- `string` - text values

### Modifying State

Use `setState` on a choice to update values:

```json
{
  "text": "Pick up the key",
  "goto": "next_room",
  "setState": {
    "hasKey": true,
    "itemsFound": 3
  }
}
```

### Conditional Choices

Use `condition` to show/hide choices based on state:

```json
{
  "text": "Unlock the door",
  "goto": "treasury",
  "condition": { "hasKey": true }
}
```

This choice only appears if `hasKey` is `true`.

**Multiple conditions** all must be true:

```json
{
  "text": "Face the final boss",
  "goto": "boss_fight",
  "condition": {
    "hasWeapon": true,
    "health": 50
  }
}
```

## Adding Your Story

1. Create your story file: `public/stories/my-story.adventure.json`

2. Add it to the manifest (`public/stories/manifest.json`):

```json
{
  "stories": [
    {
      "id": "my-story",
      "title": "My Amazing Story",
      "author": "Your Name",
      "description": "An incredible adventure awaits...",
      "file": "my-story.adventure.json"
    }
  ]
}
```

3. Optionally add a cover image: `public/covers/my-story.jpg`

## Best Practices

### Writing Tips

1. **Start strong** - Your first passage sets the tone
2. **Keep passages focused** - One scene or decision per passage
3. **Limit choices** - 2-4 options is ideal; more can overwhelm
4. **Use state sparingly** - Only track what matters
5. **Multiple endings** - Reward different playstyles

### Passage IDs

Use clear, descriptive IDs:

```
✓ "forest_clearing"
✓ "meet_the_wizard"
✓ "ending_victory"

✗ "p1"
✗ "next"
✗ "asdfgh"
```

### Text Formatting

Use double newlines for paragraphs:

```json
{
  "text": "The first paragraph of your passage.\n\nThe second paragraph continues the scene.\n\nAnd the third brings it home."
}
```

### Testing Your Story

1. Run the development server: `npm run dev`
2. Play through every path
3. Check that conditional choices appear correctly
4. Verify all endings are reachable

## Example: State-Based Story

Here's a more complex example using state:

```json
{
  "id": "the-merchant",
  "title": "The Merchant's Dilemma",
  "author": "Example Author",
  "description": "Trade, barter, and survive.",
  "version": "1.0",
  "initialState": {
    "gold": 10,
    "hasMap": false,
    "reputation": 0
  },
  "start": "market",
  "passages": {
    "market": {
      "text": "You arrive at the bustling market square with 10 gold coins in your purse. A merchant eyes you suspiciously from behind his stall.",
      "choices": [
        {
          "text": "Buy a treasure map (8 gold)",
          "goto": "bought_map",
          "setState": { "gold": 2, "hasMap": true }
        },
        {
          "text": "Offer to help the merchant",
          "goto": "help_merchant"
        },
        {
          "text": "Leave the market",
          "goto": "leave"
        }
      ]
    },
    "bought_map": {
      "text": "The map shows a path to hidden treasure in the mountains. But with only 2 gold left, the journey will be dangerous.",
      "choices": [
        {
          "text": "Follow the map to the treasure",
          "goto": "treasure_hunt"
        },
        {
          "text": "Sell the map to another traveler",
          "goto": "sell_map"
        }
      ]
    },
    "help_merchant": {
      "text": "You spend the day helping the merchant with his stall. He's grateful and pays you 5 gold. More importantly, he trusts you now.",
      "choices": [
        {
          "text": "Ask about the treasure map",
          "goto": "merchant_map",
          "setState": { "gold": 15, "reputation": 1 }
        }
      ]
    },
    "merchant_map": {
      "text": "The merchant lowers his voice. 'That map is a fake. But I know where the real treasure is. Help me retrieve it, and we split it evenly.'",
      "choices": [
        {
          "text": "Accept his offer",
          "goto": "partnership_ending",
          "condition": { "reputation": 1 }
        },
        {
          "text": "Decline politely",
          "goto": "leave"
        }
      ]
    },
    "partnership_ending": {
      "text": "Together, you and the merchant find the treasure—a chest of ancient coins and jewels. You split it fairly, and gain a trusted friend in the process.\n\nSome treasures are worth more than gold.",
      "isEnding": true,
      "endingType": "good"
    },
    "treasure_hunt": {
      "text": "You follow the map into the mountains, but it leads only to an empty cave. You've been swindled.\n\nWith no gold and no supplies, the journey home is long and hard.",
      "isEnding": true,
      "endingType": "bad"
    },
    "sell_map": {
      "text": "A gullible traveler pays you 12 gold for the map. You feel a pang of guilt as he excitedly heads toward the mountains.\n\nBut gold is gold.",
      "isEnding": true,
      "endingType": "neutral"
    },
    "leave": {
      "text": "You leave the market and return to your ordinary life. Perhaps adventure simply wasn't meant for you.",
      "isEnding": true,
      "endingType": "neutral"
    }
  }
}
```

## Troubleshooting

### Story doesn't appear in library

- Check `manifest.json` has correct `id` and `file` path
- Ensure the `.adventure.json` file exists in `public/stories/`
- Check browser console for loading errors

### Choices not appearing

- Verify passage IDs match exactly (case-sensitive)
- Check condition values match state types
- Ensure the passage has a `choices` array

### State not working

- Confirm `initialState` is defined at story root
- Check `setState` uses correct value types
- Conditions must exactly match state values

## Contributing Stories

We welcome community stories! To contribute:

1. Fork the repository
2. Create your story following this format
3. Test thoroughly
4. Submit a pull request

Please ensure your story:
- Is original content or properly licensed
- Contains no offensive material
- Has been tested for all paths
- Includes at least 2 endings

