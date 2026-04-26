// === ROLES ===
export type Role = 'FORENSIC' | 'MURDERER' | 'ACCOMPLICE' | 'WITNESS' | 'INVESTIGATOR';

// === GAME STATE MACHINE ===
export type GameState =
  | 'LOBBY'
  | 'ROLE_ASSIGN'
  | 'NIGHT_EVIL_DISCUSS'
  | 'NIGHT_EVIL_CHOOSE_CARDS'
  | 'NIGHT_WITNESS_REVEAL'
  | 'NIGHT_FORENSIC_REVEAL'
  | 'INVESTIGATION_ROUND_1'
  | 'INVESTIGATION_ROUND_2'
  | 'INVESTIGATION_ROUND_3'
  | 'EVENT_RESOLVING'
  | 'ACCUSATION_RESOLVING'
  | 'WITNESS_HUNT'
  | 'GAME_END';

// === CARDS ===
export interface MeansCard {
  id: string;
  name: string;
  description: string;
}

export interface ClueCard {
  id: string;
  name: string;
  description: string;
}

// === SCENE TILES ===
export type TileCategory = 'LOCATION' | 'CAUSE' | 'CLUE';

export interface SceneTile {
  id: string;
  category: TileCategory;
  title: string;
  options: string[];
}

// === EVENT CARDS ===
export type EventType =
  | 'COUNTDOWN'
  | 'SECRET_TESTIMONY'
  | 'ERRONEOUS_INFORMATION'
  | 'RULED_OUT_EVIDENCE'
  | 'A_GOOD_TWIST'
  | 'A_USEFUL_CLUE';

export interface EventCard {
  id: string;
  type: EventType;
  name: string;
  description: string;
}

// === PLAYER ===
export interface PlayerHand {
  means: MeansCard[];
  clues: ClueCard[];
  flippedClues: string[];
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  role?: Role;
  hand: PlayerHand;
  trueMeans?: string;
  trueClue?: string;
  badges: number;
  extraBadges: number;
  isConnected: boolean;
}

// === ACCUSATION ===
export interface Accusation {
  accuserId: string;
  targetId: string;
  meansCardId: string;
  clueCardId: string;
  result: 'CORRECT' | 'WRONG' | 'ACCOMPLICE_FRAMED';
  timestamp: number;
}

// === WITNESS HUNT ===
export interface WitnessHunt {
  triggeredBy: string;
  deadline: number;
  targetChoice?: string;
  result?: 'WITNESS_FOUND' | 'WITNESS_SAFE';
}

// === CHAT ===
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  channel: 'PUBLIC' | 'EVIL_PRIVATE';
}

// === SCENE BOARD ===
export interface SceneBoard {
  location: SceneTile;
  cause: SceneTile;
  clues: SceneTile[];
}

// === GAME ===
export interface Game {
  id: string;
  mode: 'HUMAN_FORENSIC' | 'AI_FORENSIC';
  players: Player[];
  currentRound: 1 | 2 | 3;
  state: GameState;
  sceneBoard: SceneBoard;
  markers: Record<string, number>; // tileId -> optionIndex
  tileDeck: SceneTile[];
  eventsUsed: EventType[];
  countdownTriggered: boolean;
  publicChatLog: ChatMessage[];
  accusations: Accusation[];
  witnessHunt?: WitnessHunt;
  hostId: string;
  createdAt: number;
}

// === LOBBY ===
export interface LobbyRoom {
  id: string;
  name: string;
  hostId: string;
  players: Pick<Player, 'id' | 'name' | 'avatar' | 'isConnected'>[];
  maxPlayers: number;
  mode: 'HUMAN_FORENSIC' | 'AI_FORENSIC';
  isPrivate: boolean;
  password?: string;
  status: 'WAITING' | 'IN_GAME';
}

// === GAME RESULT ===
export type WinSide = 'GOOD' | 'EVIL';

export type EndReason =
  | 'CORRECT_ACCUSATION_NO_WITNESS'
  | 'WITNESS_HUNTED'
  | 'WITNESS_SAFE'
  | 'ACCOMPLICE_FRAMED'
  | 'ALL_BADGES_USED'
  | 'ROUNDS_EXHAUSTED'
  | 'COUNTDOWN_EVENT';

export interface GameResult {
  winner: WinSide;
  reason: EndReason;
  revealedRoles: Record<string, Role>;
  trueEvidence: { meansId: string; clueId: string };
}
