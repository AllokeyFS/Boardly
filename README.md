# Boardly

A clean, fast Kanban board built with React and TypeScript.

![Boardly](public/favicon.png)

## Features

- **Drag and drop** — move cards between columns smoothly
- **Auto-sort by priority** — cards automatically sort by High / Medium / Low
- **Edit cards** — click any card to edit title, description, priority and due date
- **Dark mode** — toggle between light and dark theme, saved automatically
- **Templates** — switch between Default, Agile and Personal board presets, each saved separately
- **Archive** — mark completed tasks as done, restore or clear them anytime
- **Search & filter** — find cards by title or filter by priority
- **Persistent storage** — everything saved in localStorage, survives page reload
- **Empty states** — clean placeholders for empty columns

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- @dnd-kit
- Vite

## Getting Started
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure
```
src/
├── types/
│   └── kanban.ts         # Card, Column, BoardState types
├── store/
│   ├── actions.ts        # Discriminated union of all actions
│   ├── reducer.ts        # Pure reducer with auto-sort logic
│   └── initialState.ts   # Preset templates + localStorage helpers
├── context/
│   └── KanbanContext.tsx # useReducer + Provider + preset switching
├── hooks/
│   ├── useTheme.ts       # Dark mode toggle
│   └── useFilter.ts      # Search and priority filter
└── components/
    ├── Board.tsx          # DnD context + header + layout
    ├── Column.tsx         # Droppable column
    ├── Card.tsx           # Draggable card
    ├── CardModal.tsx      # Edit card modal
    ├── AddCardForm.tsx    # Inline add card form
    ├── BoardPresets.tsx   # Template switcher modal
    └── Archive.tsx        # Completed tasks archive
```

## Key Design Decisions

**Normalized state** — cards stored as `Record<string, Card>`, columns hold only `cardIds[]`. Moving a card between columns is just swapping ids, not copying objects.

**useReducer over useState** — all board mutations go through a single reducer with typed actions (discriminated union). Makes state predictable and easy to debug.

**Auto-sort** — `CARD_ADD` and `CARD_MOVE` always sort the target column by priority. Sorting logic lives in the reducer, not in components.

**Preset isolation** — each template saves to its own `localStorage` key. Switching presets saves the current board first, then loads the new one.

## License

MIT