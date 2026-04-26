import { Game, Player, GameState, ChatMessage } from '../../../core/models/game.model';

const MOCK_PLAYERS: Player[] = [
  { id: 'p1', name: 'Minh', role: 'FORENSIC', hand: { means: [], clues: [], flippedClues: [] }, badges: 0, extraBadges: 0, isConnected: true },
  { id: 'p2', name: 'Hương', role: 'MURDERER', hand: {
    means: [
      { id: 'M01', name: 'Dao', description: '' },
      { id: 'M05', name: 'Búa', description: '' },
      { id: 'M12', name: 'Điện giật', description: '' },
      { id: 'M24', name: 'Kim tiêm', description: '' },
    ],
    clues: [
      { id: 'C01', name: 'Sợi tóc', description: '' },
      { id: 'C06', name: 'Đầu mẩu thuốc lá', description: '' },
      { id: 'C18', name: 'Chìa khóa', description: '' },
      { id: 'C28', name: 'Nhẫn', description: '' },
    ],
    flippedClues: [],
  }, trueMeans: 'M05', trueClue: 'C18', badges: 1, extraBadges: 0, isConnected: true },
  { id: 'p3', name: 'Tùng', role: 'ACCOMPLICE', hand: {
    means: [
      { id: 'M08', name: 'Kéo', description: '' },
      { id: 'M15', name: 'Nhấn nước', description: '' },
      { id: 'M30', name: 'Súng bắn tỉa', description: '' },
      { id: 'M44', name: 'Túi ni lông', description: '' },
    ],
    clues: [
      { id: 'C03', name: 'Dấu vân tay', description: '' },
      { id: 'C10', name: 'Giấy ghi chú', description: '' },
      { id: 'C22', name: 'Kính mắt', description: '' },
      { id: 'C40', name: 'Bật lửa', description: '' },
    ],
    flippedClues: [],
  }, trueMeans: 'M08', trueClue: 'C10', badges: 1, extraBadges: 0, isConnected: true },
  { id: 'p4', name: 'Lan', role: 'WITNESS', hand: {
    means: [
      { id: 'M02', name: 'Súng lục', description: '' },
      { id: 'M19', name: 'Cờ lê', description: '' },
      { id: 'M33', name: 'Dao găm', description: '' },
      { id: 'M46', name: 'Cái xẻng', description: '' },
    ],
    clues: [
      { id: 'C05', name: 'Nút áo', description: '' },
      { id: 'C14', name: 'Tin nhắn điện thoại', description: '' },
      { id: 'C27', name: 'Đồng hồ', description: '' },
      { id: 'C38', name: 'Điện thoại', description: '' },
    ],
    flippedClues: [],
  }, badges: 1, extraBadges: 0, isConnected: true },
  { id: 'p5', name: 'Đức', role: 'INVESTIGATOR', hand: {
    means: [
      { id: 'M03', name: 'Thuốc độc', description: '' },
      { id: 'M10', name: 'Gối', description: '' },
      { id: 'M28', name: 'Lửa', description: '' },
      { id: 'M38', name: 'Rắn độc', description: '' },
    ],
    clues: [
      { id: 'C07', name: 'Vết son môi', description: '' },
      { id: 'C16', name: 'Nhật ký', description: '' },
      { id: 'C30', name: 'Ví tiền', description: '' },
      { id: 'C42', name: 'Khăn tay', description: '' },
    ],
    flippedClues: [],
  }, badges: 1, extraBadges: 0, isConnected: true },
  { id: 'p6', name: 'Thảo', role: 'INVESTIGATOR', hand: {
    means: [
      { id: 'M06', name: 'Rìu', description: '' },
      { id: 'M21', name: 'Bom tự chế', description: '' },
      { id: 'M35', name: 'Thanh sắt', description: '' },
      { id: 'M48', name: 'Bàn là', description: '' },
    ],
    clues: [
      { id: 'C09', name: 'Vết bùn', description: '' },
      { id: 'C20', name: 'Vé máy bay', description: '' },
      { id: 'C33', name: 'Thuốc tây', description: '' },
      { id: 'C45', name: 'Cát', description: '' },
    ],
    flippedClues: [],
  }, badges: 1, extraBadges: 0, isConnected: true },
  { id: 'p7', name: 'Bảo', role: 'INVESTIGATOR', hand: {
    means: [
      { id: 'M07', name: 'Gậy bóng chày', description: '' },
      { id: 'M16', name: 'Xyanua', description: '' },
      { id: 'M29', name: 'Cưa máy', description: '' },
      { id: 'M42', name: 'Khí ga', description: '' },
    ],
    clues: [
      { id: 'C02', name: 'Vết máu', description: '' },
      { id: 'C11', name: 'Hóa đơn', description: '' },
      { id: 'C25', name: 'Mũ', description: '' },
      { id: 'C37', name: 'USB', description: '' },
    ],
    flippedClues: [],
  }, badges: 1, extraBadges: 0, isConnected: false },
];

const MOCK_CHAT: ChatMessage[] = [
  { id: 'ch1', senderId: 'p5', senderName: 'Đức', content: 'Tôi nghĩ hung khí là dao', timestamp: Date.now() - 60000, channel: 'PUBLIC' },
  { id: 'ch2', senderId: 'p4', senderName: 'Lan', content: 'Nhìn manh mối thì giống Búa hơn', timestamp: Date.now() - 45000, channel: 'PUBLIC' },
  { id: 'ch3', senderId: 'p6', senderName: 'Thảo', content: 'Pháp y đánh dấu "Chấn thương đầu" rồi', timestamp: Date.now() - 30000, channel: 'PUBLIC' },
  { id: 'ch4', senderId: 'p3', senderName: 'Tùng', content: 'Có thể là Điện giật cũng nên', timestamp: Date.now() - 15000, channel: 'PUBLIC' },
];

export function createMockGame(state: GameState, viewAsRole: string = 'INVESTIGATOR'): Game {
  const players = MOCK_PLAYERS.map(p => ({ ...p, hand: { ...p.hand } }));

  // If viewing as non-self role, hide other players' cards
  const viewPlayer = players.find(p => p.role === viewAsRole) || players[4];

  // For other players, mask cards unless forensic/evil
  const maskedPlayers = players.map(p => {
    if (p.id === viewPlayer.id) return p;
    if (viewAsRole === 'FORENSIC') return p; // Forensic sees all
    if ((viewAsRole === 'MURDERER' || viewAsRole === 'ACCOMPLICE') &&
        (p.role === 'MURDERER' || p.role === 'ACCOMPLICE')) return p;
    return {
      ...p,
      role: state === 'GAME_END' ? p.role : undefined,
      hand: {
        means: p.hand.means.map(() => ({ id: '?', name: '?', description: '' })),
        clues: p.hand.clues.map(() => ({ id: '?', name: '?', description: '' })),
        flippedClues: p.hand.flippedClues,
      },
    };
  });

  return {
    id: 'mock-room',
    mode: 'HUMAN_FORENSIC',
    players: maskedPlayers,
    currentRound: state.includes('ROUND_3') ? 3 : state.includes('ROUND_2') ? 2 : 1,
    state,
    sceneBoard: {
      location: { id: 'L01', category: 'LOCATION', title: 'Nơi xảy ra án', options: ['Phòng ngủ', 'Nhà bếp', 'Phòng khách', 'Nhà vệ sinh'] },
      cause: { id: 'CA01', category: 'CAUSE', title: 'Nguyên nhân tử vong', options: ['Mất máu', 'Ngạt thở', 'Ngộ độc', 'Chấn thương đầu'] },
      clues: [
        { id: 'CL01', category: 'CLUE', title: 'Thời gian gây án', options: ['Sáng sớm', 'Buổi trưa', 'Chiều tối', 'Nửa đêm'] },
        { id: 'CL03', category: 'CLUE', title: 'Động cơ', options: ['Tiền bạc', 'Tình ái', 'Thù hận', 'Bí mật'] },
        { id: 'CL07', category: 'CLUE', title: 'Dấu vết tại hiện trường', options: ['Máu', 'Bùn', 'Tóc', 'Vải'] },
        { id: 'CL11', category: 'CLUE', title: 'Mối quan hệ', options: ['Người lạ', 'Bạn bè', 'Gia đình', 'Đồng nghiệp'] },
      ],
    },
    markers: { L01: 0, CA01: 3, CL01: 3, CL03: 0 },
    tileDeck: [],
    eventsUsed: [],
    countdownTriggered: false,
    publicChatLog: MOCK_CHAT,
    accusations: [],
    hostId: 'p1',
    createdAt: Date.now() - 300000,
  } as Game;
}

export const DEMO_STATES: { state: GameState; label: string; viewAs: string }[] = [
  { state: 'ROLE_ASSIGN', label: 'Chia vai', viewAs: 'MURDERER' },
  { state: 'NIGHT_EVIL_DISCUSS', label: 'Đêm - Phe ác thảo luận', viewAs: 'MURDERER' },
  { state: 'NIGHT_EVIL_CHOOSE_CARDS', label: 'Đêm - Hung thủ chọn bài', viewAs: 'MURDERER' },
  { state: 'NIGHT_EVIL_CHOOSE_CARDS', label: 'Đêm - Tòng phạm chọn mồi nhử', viewAs: 'ACCOMPLICE' },
  { state: 'NIGHT_EVIL_DISCUSS', label: 'Đêm - Người khác chờ', viewAs: 'INVESTIGATOR' },
  { state: 'NIGHT_WITNESS_REVEAL', label: 'Đêm - Nhân chứng', viewAs: 'WITNESS' },
  { state: 'NIGHT_FORENSIC_REVEAL', label: 'Đêm - Pháp y', viewAs: 'FORENSIC' },
  { state: 'INVESTIGATION_ROUND_1', label: 'Điều tra vòng 1 (Điều tra viên)', viewAs: 'INVESTIGATOR' },
  { state: 'INVESTIGATION_ROUND_1', label: 'Điều tra vòng 1 (Pháp y)', viewAs: 'FORENSIC' },
  { state: 'WITNESS_HUNT', label: 'Săn nhân chứng', viewAs: 'MURDERER' },
  { state: 'GAME_END', label: 'Kết thúc - Phe thiện thắng', viewAs: 'INVESTIGATOR' },
];

export function getMockPlayerId(viewAsRole: string): string {
  const p = MOCK_PLAYERS.find(p => p.role === viewAsRole);
  return p?.id || 'p5';
}

export function getMockForensicView() {
  return {
    murdererId: 'p2',
    murdererHand: MOCK_PLAYERS[1].hand,
    murdererTrueMeans: 'M05',
    murdererTrueClue: 'C18',
    accompliceId: 'p3',
    accompliceHand: MOCK_PLAYERS[2].hand,
    accompliceTrueMeans: 'M08',
    accompliceTrueClue: 'C10',
  };
}

export function getMockWitnessView() {
  return { murdererId: 'p2', accompliceId: 'p3' };
}

export function getMockEvilView(viewAsRole: string) {
  if (viewAsRole === 'MURDERER') {
    return { partnerId: 'p3', partnerHand: MOCK_PLAYERS[2].hand };
  }
  if (viewAsRole === 'ACCOMPLICE') {
    return { partnerId: 'p2', partnerHand: MOCK_PLAYERS[1].hand };
  }
  return null;
}

export function getMockGameResult() {
  return {
    winner: 'GOOD' as const,
    reason: 'WITNESS_SAFE' as const,
    revealedRoles: {
      p1: 'FORENSIC' as const,
      p2: 'MURDERER' as const,
      p3: 'ACCOMPLICE' as const,
      p4: 'WITNESS' as const,
      p5: 'INVESTIGATOR' as const,
      p6: 'INVESTIGATOR' as const,
      p7: 'INVESTIGATOR' as const,
    },
    trueEvidence: { meansId: 'M05', clueId: 'C18' },
  };
}
