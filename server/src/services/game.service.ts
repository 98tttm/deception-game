import { GameRoom, Player, Role, SceneTile, MeansCard, ClueCard } from '../models/types';
import { ROLE_DISTRIBUTION, CARD_COUNTS } from '../models/constants';
import { meansCards, clueCards, locationTiles, causeTiles, clueTiles, eventCards } from '../data/card-data';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function assignRoles(room: GameRoom): void {
  const count = room.players.length;
  const dist = ROLE_DISTRIBUTION[count];
  if (!dist) throw new Error(`Invalid player count: ${count}`);

  // If AI forensic mode, no FORENSIC role - extra INVESTIGATOR
  const roles: Role[] = [];
  for (const [role, num] of Object.entries(dist) as [Role, number][]) {
    if (room.mode === 'AI_FORENSIC' && role === 'FORENSIC') {
      roles.push(...Array(num).fill('INVESTIGATOR'));
    } else {
      roles.push(...Array(num).fill(role));
    }
  }

  const shuffledRoles = shuffle(roles);
  room.players.forEach((player, i) => {
    player.role = shuffledRoles[i];
    player.badges = 1;
    player.extraBadges = 0;
  });
}

export function dealCards(room: GameRoom): void {
  const shuffledMeans = shuffle(meansCards);
  const shuffledClues = shuffle(clueCards);
  let meansIdx = 0;
  let cluesIdx = 0;

  for (const player of room.players) {
    if (player.role === 'FORENSIC') continue;
    player.hand = {
      means: shuffledMeans.slice(meansIdx, meansIdx + CARD_COUNTS.CARDS_PER_PLAYER),
      clues: shuffledClues.slice(cluesIdx, cluesIdx + CARD_COUNTS.CARDS_PER_PLAYER),
      flippedClues: [],
    };
    meansIdx += CARD_COUNTS.CARDS_PER_PLAYER;
    cluesIdx += CARD_COUNTS.CARDS_PER_PLAYER;
  }
}

export function setupSceneBoard(room: GameRoom): void {
  const loc = shuffle(locationTiles);
  const cause = shuffle(causeTiles);

  // Clue tiles + event cards shuffled together
  const cluePool = shuffle([...clueTiles, ...eventCards]);

  // For round 1, skip event cards
  const round1Clues: SceneTile[] = [];
  const remaining = [...cluePool];
  while (round1Clues.length < CARD_COUNTS.CLUE_TILES_PER_ROUND && remaining.length > 0) {
    const tile = remaining.shift()!;
    if ('type' in tile) {
      // Event card - put back for later rounds
      remaining.push(tile);
      continue;
    }
    round1Clues.push(tile as SceneTile);
  }

  room.sceneBoard = {
    location: loc[0],
    cause: cause[0],
    clues: round1Clues,
  };
  room.tileDeck = remaining;
}

export function getPlayerView(room: GameRoom, playerId: string): Partial<GameRoom> {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return {};

  // Base view: everyone sees game state, scene board, markers, chat, accusations
  const baseView = {
    id: room.id,
    state: room.state,
    currentRound: room.currentRound,
    sceneBoard: room.sceneBoard,
    markers: room.markers,
    chatLog: room.chatLog,
    accusations: room.accusations,
    countdownTriggered: room.countdownTriggered,
    gameResult: room.gameResult,
    witnessHunt: room.witnessHunt
      ? { triggeredBy: room.witnessHunt.triggeredBy, deadline: room.witnessHunt.deadline, result: room.witnessHunt.result }
      : undefined,
    mode: room.mode,
  };

  // Players list: hide roles of others (unless game ended)
  const playersView = room.players.map((p) => ({
    id: p.id,
    name: p.name,
    isConnected: p.isConnected,
    role: room.state === 'GAME_END' || p.id === playerId ? p.role : undefined,
    hand: p.id === playerId ? p.hand : { means: p.hand.means.map(() => ({ id: '?', name: '?' })), clues: p.hand.clues.map(() => ({ id: '?', name: '?' })), flippedClues: p.hand.flippedClues },
    badges: p.badges,
    extraBadges: p.extraBadges,
  }));

  // Role-specific visibility
  const role = player.role;
  let extraInfo: Record<string, unknown> = {};

  if (role === 'FORENSIC') {
    // Forensic sees murderer + accomplice identity & cards
    const murderer = room.players.find((p) => p.role === 'MURDERER');
    const accomplice = room.players.find((p) => p.role === 'ACCOMPLICE');
    extraInfo = {
      forensicView: {
        murdererId: murderer?.id,
        murdererHand: murderer?.hand,
        murdererTrueMeans: murderer?.trueMeans,
        murdererTrueClue: murderer?.trueClue,
        accompliceId: accomplice?.id,
        accompliceHand: accomplice?.hand,
        accompliceTrueMeans: accomplice?.trueMeans,
        accompliceTrueClue: accomplice?.trueClue,
      },
    };
  } else if (role === 'MURDERER') {
    const accomplice = room.players.find((p) => p.role === 'ACCOMPLICE');
    extraInfo = {
      evilView: {
        partnerId: accomplice?.id,
        partnerHand: accomplice ? accomplice.hand : undefined,
      },
    };
  } else if (role === 'ACCOMPLICE') {
    const murderer = room.players.find((p) => p.role === 'MURDERER');
    extraInfo = {
      evilView: {
        partnerId: murderer?.id,
        partnerHand: murderer ? murderer.hand : undefined,
      },
    };
  } else if (role === 'WITNESS') {
    const murderer = room.players.find((p) => p.role === 'MURDERER');
    const accomplice = room.players.find((p) => p.role === 'ACCOMPLICE');
    extraInfo = {
      witnessView: {
        murdererId: murderer?.id,
        accompliceId: accomplice?.id,
        // Witness sees identity but NOT cards
      },
    };
  }

  return { ...baseView, players: playersView as any, ...extraInfo };
}
