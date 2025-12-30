# Choose Your Adventure

A beautiful, minimal interactive fiction engine for the web. Create and play text-based choose-your-own-adventure stories with elegant typography and seamless light/dark mode support.

## Features

- **Elegant Design** — Typography-first approach using Cormorant Garamond for immersive storytelling
- **Light & Dark Mode** — Automatic system preference detection with manual toggle
- **State Tracking** — Remember player choices and show conditional paths
- **Story Library** — Browse and select from multiple adventures
- **Simple JSON Format** — Easy-to-write story format for authors
- **Responsive** — Beautiful on desktop, tablet, and mobile
- **No Build Required for Stories** — Add new stories by dropping JSON files

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Creating Stories

Stories are JSON files placed in `public/stories/`. Here's a minimal example:

```json
{
  "id": "my-story",
  "title": "My Adventure",
  "author": "Your Name",
  "description": "A thrilling tale...",
  "version": "1.0",
  "start": "intro",
  "passages": {
    "intro": {
      "text": "You find yourself at a crossroads.",
      "choices": [
        { "text": "Go left", "goto": "left" },
        { "text": "Go right", "goto": "right" }
      ]
    },
    "left": {
      "text": "You found treasure!",
      "isEnding": true,
      "endingType": "good"
    },
    "right": {
      "text": "You fell in a hole.",
      "isEnding": true,
      "endingType": "bad"
    }
  }
}
```

Add your story to `public/stories/manifest.json`:

```json
{
  "stories": [
    {
      "id": "my-story",
      "title": "My Adventure",
      "author": "Your Name",
      "description": "A thrilling tale...",
      "file": "my-story.adventure.json"
    }
  ]
}
```

See [docs/story-format.md](docs/story-format.md) for the complete specification.

## Story Format Features

### Basic Branching

Navigate between passages using choices:

```json
{
  "text": "A door blocks your path.",
  "choices": [
    { "text": "Open the door", "goto": "behind_door" },
    { "text": "Turn back", "goto": "hallway" }
  ]
}
```

### State Tracking

Track player progress with state variables:

```json
{
  "initialState": {
    "hasKey": false,
    "health": 100
  }
}
```

Modify state with choices:

```json
{
  "text": "Pick up the key",
  "goto": "next_room",
  "setState": { "hasKey": true }
}
```

### Conditional Choices

Show choices only when conditions are met:

```json
{
  "text": "Unlock the door",
  "goto": "treasure_room",
  "condition": { "hasKey": true }
}
```

### Multiple Endings

Mark passages as endings with optional types:

```json
{
  "text": "You saved the kingdom!",
  "isEnding": true,
  "endingType": "good"
}
```

Ending types: `"good"`, `"bad"`, `"neutral"`

## Tech Stack

- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **React Router** — Navigation
- **CSS Modules** — Scoped styling
- **CSS Variables** — Theming

## Project Structure

```
choose-adventure/
├── public/
│   └── stories/           # Story JSON files
│       ├── manifest.json  # Story registry
│       └── *.adventure.json
├── src/
│   ├── components/        # React components
│   ├── context/           # React contexts
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript types
│   ├── utils/             # Utilities
│   └── styles/            # Global styles
├── docs/
│   └── story-format.md    # Author documentation
└── README.md
```

## Contributing

Contributions welcome! Whether it's:

- **Stories** — Write and share adventures (see [CONTRIBUTING.md](CONTRIBUTING.md))
- **Features** — Improve the engine
- **Design** — Enhance the UI/UX
- **Documentation** — Help others get started

### Writing Stories

Want to contribute a story? Check out:
- [CONTRIBUTING.md](CONTRIBUTING.md) — Full guide to writing and submitting stories
- [docs/story-format.md](docs/story-format.md) — Technical specification for the JSON format

## License

MIT License — use freely for personal and commercial projects.

---

Made with care for storytellers and adventurers.
