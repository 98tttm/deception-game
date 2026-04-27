# Deception Game - Project Instructions

## Project Overview
Board game "Deception: Murder in Hong Kong" implemented as a web app.
- **Frontend**: Angular 19 (standalone components), Tailwind CSS
- **Backend**: Firebase (Firestore, Cloud Functions, Realtime Database, Auth)
- **Deployment**: Firebase Hosting + Cloud Functions (single `firebase deploy`)
- **Language**: Vietnamese UI

## Architecture

### Frontend (`deception-game/`)
- `src/app/pages/game/` - Main game component and sub-components
- `src/app/pages/game/components/` - Night phase, investigation board, accusation, cards, etc.
- `src/app/pages/game/utils/mock-data.ts` - Demo/walkthrough mock data
- `src/app/pages/demo/` - Static demo walkthrough (prev/next navigation)
- `src/app/pages/lobby/` - Room list, create room, join room, "Chơi thử (Bot)"
- `src/app/core/services/firebase.service.ts` - Firebase client (auth, Firestore listeners, callable functions, Realtime DB)
- `src/app/core/services/game-state.service.ts` - Local game state management (BehaviorSubjects)
- `src/styles.scss` - Global styles (card glow, animations, glass morphism)
- `public/assets/` - Card images (blue_card=means, red_card=clues, hint_card, etc.)

### Cloud Functions (`functions/`)
- `src/index.ts` - All callable Cloud Functions (createRoom, joinRoom, startGame, chooseCards, etc.)
- `src/game.ts` - Core game logic (assignRoles, dealCards, setupSceneBoard, buildPlayerView)
- `src/bot.ts` - Bot AI for demo/solo play, writeRoomAndViews helper
- `src/types.ts` - TypeScript interfaces (Player, RoomDoc, PlayerViewDoc, etc.)
- `src/constants.ts` - Player limits (4-12), role distribution, timers
- `src/card-data.ts` - All card definitions (Vietnamese)

### Firebase Config (root)
- `firebase.json` - Hosting, Functions, Firestore, Database, Emulators config
- `firestore.rules` - Security rules (playerViews readable only by owner)
- `database.rules.json` - Realtime DB rules (evil selection preview)
- `.firebaserc` - Project alias

### Legacy Server (`server/`) - DEPRECATED
- Old Socket.IO server, kept for reference only
- All logic has been migrated to `functions/`

## Data Model

### Firestore
```
rooms/{roomId}           - Room state (public), players array
  /playerViews/{uid}     - Personalized view per player (role-restricted reads)
  /chat/{msgId}          - Public chat messages
  /evilChat/{msgId}      - Private evil team chat
```

### Realtime Database
```
roomsLive/{roomId}/evilSelecting/{uid} - Ephemeral card selection preview
```

## Game Flow
```
LOBBY → NIGHT_EVIL_DISCUSS → NIGHT_EVIL_CHOOSE_CARDS
→ NIGHT_WITNESS_REVEAL → NIGHT_FORENSIC_REVEAL
→ INVESTIGATION_ROUND_1/2/3 (with EVENT_RESOLVING, ACCUSATION_RESOLVING)
→ WITNESS_HUNT → GAME_END
```

## Key Patterns
- Roles: FORENSIC, MURDERER, ACCOMPLICE, WITNESS, INVESTIGATOR
- Player views are personalized via `buildPlayerView()` - each player sees different data
- Evil team sees each other's cards + real-time selection glow (purple for partner)
- Forensic sees all cards with glow on chosen evidence
- Bot players have `isBot: true` flag, auto-act via `processBotActions()`
- Card component supports `selected` (red glow) and `partnerSelected` (purple glow)
- Firebase Anonymous Auth for player identity
- All game mutations go through Cloud Functions (callable), never direct Firestore writes

## Development
- Frontend: `cd deception-game && ng serve --open`
- Emulators: `firebase emulators:start` (runs all Firebase services locally)
- Build functions: `cd functions && npm run build`
- Deploy all: `firebase deploy`

## Conventions
- Vietnamese for all UI text
- Inline templates in Angular components (no separate .html files)
- Card images referenced via utility functions in `utils/card-images.ts`
- Mock data in `utils/mock-data.ts` must stay in sync with function game logic
- Cloud Functions region: `asia-southeast1`
