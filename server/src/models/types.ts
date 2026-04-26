export type Role = 'FORENSIC' | 'MURDERER' | 'ACCOMPLICE' | 'WITNESS' | 'INVESTIGATOR';

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

export type TileCategory = 'LOCATION' | 'CAUSE' | 'CLUE';
export type EventType =
  | 'COUNTDOWN'
  | 'SECRET_TESTIMONY'
  | 'ERRONEOUS_INFORMATION'
  | 'RULED_OUT_EVIDENCE'
  | 'A_GOOD_TWIST'
  | 'A_USEFUL_CLUE';

export type WinSide = 'GOOD' | 'EVIL';
export type EndReason =
  | 'CORRECT_ACCUSATION_NO_WITNESS'
  | 'WITNESS_HUNTED'
  | 'WITNESS_SAFE'
  | 'ACCOMPLICE_FRAMED'
  | 'ALL_BADGES_USED'
  | 'ROUNDS_EXHAUSTED'
  | 'COUNTDOWN_EVENT';

// === Cards ===
export interface MeansCard {
  id: string;
  name: string;
}

export interface ClueCard {
  id: string;
  name: string;
}

export interface SceneTile {
  id: string;
  category: TileCategory;
  title: string;
  options: string[];
}

export interface EventCard {
  id: string;
  type: EventType;
  name: string;
}

// === Player ===
export interface Player {
  id: string;
  socketId: string;
  name: string;
  isBot?: boolean;
  role?: Role;
  hand: {
    means: MeansCard[];
    clues: ClueCard[];
    flippedClues: string[];
  };
  trueMeans?: string;
  trueClue?: string;
  badges: number;
  extraBadges: number;
  isConnected: boolean;
}

// === Accusation ===
export interface Accusation {
  accuserId: string;
  targetId: string;
  meansCardId: string;
  clueCardId: string;
  result: 'CORRECT' | 'WRONG' | 'ACCOMPLICE_FRAMED';
  timestamp: number;
}

// === Witness Hunt ===
export interface WitnessHunt {
  triggeredBy: string;
  deadline: number;
  targetChoice?: string;
  result?: 'WITNESS_FOUND' | 'WITNESS_SAFE';
}

// === Chat ===
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  channel: 'PUBLIC' | 'EVIL_PRIVATE';
}

// === Game Room ===
export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  mode: 'HUMAN_FORENSIC' | 'AI_FORENSIC';
  isPrivate: boolean;
  password?: string;
  maxPlayers: number;
  players: Player[];
  state: GameState;
  currentRound: 1 | 2 | 3;
  sceneBoard: {
    location: SceneTile | null;
    cause: SceneTile | null;
    clues: SceneTile[];
  };
  markers: Record<string, number>;
  tileDeck: (SceneTile | EventCard)[];
  eventsUsed: EventType[];
  countdownTriggered: boolean;
  chatLog: ChatMessage[];
  accusations: Accusation[];
  witnessHunt?: WitnessHunt;
  gameResult?: {
    winner: WinSide;
    reason: EndReason;
  };
  timers: {
    current?: NodeJS.Timeout;
    endsAt?: number;
  };
}

// === Lobby view (safe to send to clients) ===
export interface LobbyRoomView {
  id: string;
  name: string;
  hostId: string;
  players: { id: string; name: string; isConnected: boolean }[];
  maxPlayers: number;
  mode: 'HUMAN_FORENSIC' | 'AI_FORENSIC';
  isPrivate: boolean;
  status: 'WAITING' | 'IN_GAME';
}
