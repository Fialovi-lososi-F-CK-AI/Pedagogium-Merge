# WA Project 

A browser-based physics game inspired by **Suika Game** (Watermelon Game), built as a school web application project. Drop and merge circles to stack up your score — with a twist: the circles feature custom sprites of real people!

## How to Play

- Move your mouse left and right to aim.
- **Click** to drop a circle.
- When two circles of the **same size** collide, they **merge** into a larger one and award points.
- The bigger the merge, the higher the score!
- Don't let the stack overflow the top of the board.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, [Kaplay](https://kaplayjs.com/) (game engine), Vite |
| Backend | PHP / Symfony |
| State management | Jotai |
| Deployment | Ansible |

## Project Structure

```
src/
├── frontend/       
│   └── src/
│       ├── initGame.js   # Core game logic (physics, merging, scoring)
│       ├── ReactUI.jsx   # UI wrapper with scoreboard
│       └── main.jsx      # App entry point
└── backend/        
    └── src/
        ├── Controller/   # API endpoints
        ├── Entity/       # User, Score
        ├── Repository/   # Database queries
        └── Service/      # Business logic
ansible/            # Server provisioning & deployment playbooks
```

## Getting Started

### Frontend

```bash
cd src/frontend
npm install
npm run dev
```

### Backend

```bash
cd src/backend
composer install
php bin/console doctrine:migrations:migrate
symfony server:start
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming conventions, commit message format, and pull request guidelines.
