# Contributing Stories

We welcome community story contributions! This guide explains how to write and submit your own choose-your-own-adventure story.

## Quick Start

1. **Read the format spec**: See [docs/story-format.md](docs/story-format.md) for the complete JSON format
2. **Write your story**: Create a `.adventure.json` file
3. **Test locally**: Run the app and play through your story
4. **Submit**: Open a Pull Request

## Story Guidelines

### Content Requirements

- **Original work**: Stories must be your own original creation
- **Appropriate content**: No hate speech, explicit content, or harmful material
- **Complete narratives**: Stories should have a clear beginning, middle, and multiple endings
- **Minimum length**: At least 10 passages with 2+ endings
- **Tested paths**: All branches must be playable and lead to an ending

### Quality Standards

- **Engaging writing**: Clear, evocative prose that draws readers in
- **Meaningful choices**: Decisions should feel consequential
- **Logical flow**: Story progression should make sense
- **Proofread**: Check spelling, grammar, and punctuation
- **Consistent tone**: Maintain your story's voice throughout

### Technical Requirements

- Valid JSON syntax (use a validator!)
- Unique story `id` (lowercase, hyphenated)
- All passage references must exist
- No orphaned passages (unreachable from start)
- State variables must be initialized before use

## Writing Your Story

### 1. Plan Your Structure

Before writing, sketch out your story's branching structure:

```
Start
├── Choice A
│   ├── Outcome A1 → Ending 1
│   └── Outcome A2 → Choice C
├── Choice B
│   └── Outcome B1 → Choice C
└── Choice C
    ├── Ending 2
    └── Ending 3
```

### 2. Create Your File

Create a new file in `public/stories/` with the naming convention:
```
your-story-title.adventure.json
```

### 3. Start with the Template

```json
{
  "id": "your-story-id",
  "title": "Your Story Title",
  "author": "Your Name",
  "description": "A compelling one-sentence hook for your story.",
  "version": "1.0",
  "initialState": {},
  "start": "opening",
  "passages": {
    "opening": {
      "text": "Your opening paragraph sets the scene...",
      "choices": [
        {
          "text": "First choice",
          "goto": "passage_a"
        },
        {
          "text": "Second choice", 
          "goto": "passage_b"
        }
      ]
    },
    "passage_a": {
      "text": "What happens when they choose the first option...",
      "choices": []
    },
    "passage_b": {
      "text": "What happens when they choose the second option...",
      "isEnding": true,
      "endingType": "good"
    }
  }
}
```

### 4. Write Your Passages

Tips for great passages:

- **Opening hook**: Start with something intriguing
- **Sensory details**: Describe what the reader sees, hears, feels
- **Character voice**: If there's dialogue, make it distinctive
- **Tension**: Build stakes as the story progresses
- **Paragraph breaks**: Use `\n\n` to separate paragraphs

### 5. Craft Meaningful Choices

Good choices:
- Present genuine dilemmas
- Have different consequences
- Reflect character decisions
- Move the story forward

Avoid:
- "Go left" / "Go right" without context
- Choices that lead to the same outcome
- Too many options (2-4 is ideal)

### 6. Use State Wisely

State tracking can add depth:

```json
{
  "initialState": {
    "hasSword": false,
    "metWizard": false,
    "gold": 0
  }
}
```

Use conditions to reveal hidden paths:

```json
{
  "text": "The dragon blocks your path.",
  "choices": [
    {
      "text": "Fight with your sword",
      "goto": "fight_dragon",
      "condition": { "hasSword": true }
    },
    {
      "text": "Try to negotiate",
      "goto": "talk_dragon"
    }
  ]
}
```

## Testing Your Story

### Local Testing

1. Clone the repository
2. Add your story file to `public/stories/`
3. Add an entry to `public/stories/manifest.json`
4. Run `npm install && npm run dev`
5. Play through every path

### Checklist

- [ ] All passages are reachable
- [ ] All endings are achievable
- [ ] No broken passage references
- [ ] State conditions work correctly
- [ ] Text displays properly
- [ ] No typos or grammatical errors

### JSON Validation

Validate your JSON before submitting:
- Use [JSONLint](https://jsonlint.com/)
- Or run: `npx jsonlint public/stories/your-story.adventure.json`

## Submitting Your Story

### 1. Fork the Repository

Click "Fork" on GitHub to create your own copy.

### 2. Add Your Story

- Add your `.adventure.json` file to `public/stories/`
- Update `public/stories/manifest.json` to include your story
- Optionally add a cover image to `public/covers/`

### 3. Open a Pull Request

Create a PR with:
- **Title**: `[Story] Your Story Title`
- **Description**: Brief summary of your story (no spoilers!)
- **Checklist**: Confirm you've tested all paths

### 4. Review Process

A maintainer will:
1. Test your story for technical issues
2. Review content for guidelines compliance
3. Provide feedback or request changes
4. Merge once approved

## Story Ideas

Need inspiration? Here are some genres that work well:

- **Mystery/Thriller**: Solve a crime, escape danger
- **Fantasy**: Magic, quests, mythical creatures
- **Sci-Fi**: Space exploration, AI, future societies
- **Horror**: Suspense, supernatural, psychological
- **Historical**: Period settings, real events reimagined
- **Romance**: Love stories with meaningful choices
- **Comedy**: Humor, absurd situations, satire

## Examples

Check out the included stories for inspiration:

- **The Lighthouse**: Atmospheric mystery with supernatural elements
- **The Defector**: Tense spy thriller with branching outcomes
- **The Man on the Bench**: Psychological suspense with dark themes

## Questions?

- Open an issue on GitHub
- Check existing stories for examples
- Review [docs/story-format.md](docs/story-format.md) for technical details

---

Thank you for contributing to Choose Your Adventure! Every story makes the collection richer for everyone.

