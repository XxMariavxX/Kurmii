# Kurmi — Daily Word Guess Game

<p align="center">
  <img src="frontend/src/assets/favicon.ico" alt="Kurmi" width="80" />
</p>

A full-stack Wordle-inspired game where players have 6 attempts to guess a hidden 5-letter word that changes every day at midnight.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router DOM 7, Vite 7 |
| Backend | Fastify 5, Node.js ≥ 22, ES Modules |
| Package manager | pnpm 10 (monorepo workspaces) |

## How it works

- A new word is selected each day using a date-seeded deterministic algorithm
- The word rotates automatically at midnight
- After each guess the server **streams** letter results via SSE
- Feedback colours:
  - 🟩 Correct letter in the correct position
  - 🟨 Correct letter in the wrong position
  - ⬜ Letter not in the word

## Hint system

Each player gets **2 carrot hints** per day. Each hint reveals one letter that is in the word and has not been guessed yet. Hint requests are throttled server-side with a concurrency-limited priority queue (max 4 simultaneous tasks).

## Project structure

```
kurmi/
├── backend/                  # Fastify API server (port 3001)
│   ├── app.js                # Server entry — registers plugins & routes
│   ├── controllers/
│   │   ├── wordController.js # Daily word selection, guess checking (memoized)
│   │   └── authController.js # User login stub
│   ├── lib/
│   │   ├── event.js          # Internal event bus (word:changed)
│   │   ├── helpers.js        # Async filter + slow letter check
│   │   ├── iterator.js       # Custom iterator utility
│   │   ├── memoize.js        # LFU/LRU cache with configurable capacity
│   │   ├── priorityQueue.js  # Bounded priority queue for hint tasks
│   │   ├── wordDictionary.js # Set of valid 5-letter words
│   │   └── wordGenerator.js  # Word iterator factory
│   ├── plugins/
│   │   └── dailyWordRotation.js  # Schedules word rotation at midnight
│   ├── routes/
│   │   └── root.js           # API route definitions
│   ├── services/
│   │   └── dailyWordGenerator.js # Date → word mapping (memoized, 365-slot cache)
│   ├── test/
│   │   └── api.integration.test.js
│   └── words/
│       └── fiveLetterWords.js
└── frontend/                 # React SPA (Vite dev server)
    └── src/
        ├── api.js            # Fetch helpers + SSE stream reader
        ├── App.jsx           # Router (/, /quiz, /submit)
        ├── components/
        │   ├── MainQuiz.jsx  # Core game logic & hint modal
        │   ├── BoxQuiz.jsx   # Single guess row
        │   ├── Keyboard.jsx  # On-screen keyboard
        │   ├── MainHome.jsx
        │   ├── Header.jsx
        │   └── Footer.jsx
        └── pages/
            ├── MainPage.jsx
            ├── QuizPage.jsx
            └── Login.jsx
```

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/daily-word` | Returns `{ wordLength: 5, gameId: "YYYY-MM-DD" }` |
| `POST` | `/check-word` | Body: `{ guess: string }` — streams SSE letter results |
| `GET` | `/hints?guessed=A,B` | Returns `{ hint: "X" }` — a letter in the word not yet guessed |

The `/check-word` endpoint responds with `text/event-stream`. Each event is a JSON object:

```json
{ "type": "letter", "index": 0, "status": "correct" }
{ "type": "result", "won": true }
```

## Requirements

- Node.js ≥ 22
- pnpm ≥ 10

## Getting started

```bash
# Install all dependencies
pnpm install

# Start both backend and frontend in development mode
pnpm dev
```

The Vite dev server proxies `/api/*` → `http://127.0.0.1:3001`, so no CORS configuration is needed during development.

To run only one package:

```bash
pnpm --filter backend dev
pnpm --filter frontend dev
```

## Building for production

```bash
pnpm build        # builds the frontend (output: frontend/dist)
pnpm start        # starts both backend and frontend in production mode
```

## Running tests

```bash
pnpm --filter backend test
```

Tests use Node.js built-in `node:test` runner (no extra test framework required). The suite covers:

- `GET /daily-word` — response shape validation
- `POST /check-word` — invalid input rejection
- `POST /check-word` — correct word acceptance
- `GET /hints` — hint response shape

## License

MIT — see [LICENSE.md](LICENSE.md)