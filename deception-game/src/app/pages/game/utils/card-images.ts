import { Role, EventType, TileCategory } from '../../../core/models/game.model';

// === MEANS CARD ID → Image filename mapping ===
const MEANS_IMAGE_MAP: Record<string, string> = {
  M01: 'DAGGER.png',
  M02: 'PISTOL.png',
  M03: 'PILL.png',
  M04: 'ROPE.png',
  M05: 'HAMMER.png',
  M06: 'AXE.png',
  M07: 'BAT.png',
  M08: 'SCISSORS.png',
  M09: 'KNIFE AND FORK.png',
  M10: 'PILLOW.png',
  M11: 'POTTED PLANT.png',
  M12: 'ELECTRIC CURRENT.png',
  M13: 'E-BIKE.png',
  M14: 'PUSH.png',
  M15: 'DROWN.png',
  M16: 'CHEMICALS.png',
  M17: 'ARSENIC.png',
  M18: 'OVERDOSE.png',
  M19: 'WRENCH.png',
  M20: 'DRILL.png',
  M21: 'EXPLOSIVES.png',
  M22: 'METAL WIRE.png',
  M23: 'STARVATION.png',
  M24: 'INJECTION.png',
  M25: 'ALCOHOL.png',
  M26: 'BRICK.png',
  M27: 'STONE.png',
  M28: 'ARSON.png',
  M29: 'CHAINSAW.png',
  M30: 'SNIPER.png',
  M31: 'HOOK.png',
  M32: 'SCULPTURE.png',
  M33: 'DAGGER.png',
  M34: 'MACHETE.png',
  M35: 'STEEL TUBE.png',
  M36: 'ELECTRIC BATON.png',
  M37: 'METAL CHAIN.png',
  M38: 'VENOMOUS SNAKE.png',
  M39: 'VENOMOUS SCORPION.png',
  M40: 'MAD DOG.png',
  M41: 'MERCURY.png',
  M42: 'POISONOUS GAS.png',
  M43: 'PACKING TAPE.png',
  M44: 'PLASTIC BAG.png',
  M45: 'WIRE.png',
  M46: 'TROWEL.png',
  M47: 'CRUTCH.png',
  M48: 'LIGHTER.png',
};

// === CLUE CARD ID → Image filename mapping ===
const CLUE_IMAGE_MAP: Record<string, string> = {
  C01: 'hair.png',
  C02: 'mark.png',
  C03: 'push_pin.png',
  C04: 'cleaning_cloth.png',
  C05: 'button.png',
  C06: 'cigarette_butt.png',
  C07: 'lopstick.png',
  C08: 'PERFUME.png',
  C09: 'dirt.png',
  C10: 'note.png',
  C11: 'receopt.png',
  C12: 'model.png',
  C13: 'computer.png',
  C14: 'mobile_phone.png',
  C15: 'envelope.png',
  C16: 'diary.png',
  C17: 'maze.png',
  C18: 'key.png',
  C19: 'flip_flop.png',
  C20: 'invitation_card.png',
  C21: 'badge.png',
  C22: 'mirror.png',
  C23: 'gloves.png',
  C24: 'leather_shoe.png',
  C25: 'hat.png',
  C26: 'sugical_mask.png',
  C27: 'watch.png',
  C28: 'ring.png',
  C29: 'necklace.png',
  C30: 'wallet.png',
  C31: 'id_card.png',
  C32: 'notebook.png',
  C33: 'herbal_medicine.png',
  C34: 'test_tube.png',
  C35: 'needle_and_thread.png',
  C36: 'flyer.png',
  C37: 'usb_flash_drive.png',
  C38: 'telephone.png',
  C39: 'computer.png',
  C40: 'flashlight.png',
  C41: 'match.png',
  C42: 'handcuffs.png',
  C43: 'button.png',
  C44: 'cat.png',
  C45: 'sand.png',
  C46: 'chalk.png',
  C47: 'ink.png',
  C48: 'snacks.png',
};

// === EVENT TYPE → Image filename ===
const EVENT_IMAGE_MAP: Record<EventType, string> = {
  COUNTDOWN: 'event_countdown.jpg',
  SECRET_TESTIMONY: 'event_secret.jpg',
  ERRONEOUS_INFORMATION: 'event_information.jpg',
  RULED_OUT_EVIDENCE: 'event_evidence.jpg',
  A_GOOD_TWIST: 'event_a_good_twist.jpg',
  A_USEFUL_CLUE: 'event_a_useful_clue.jpg',
};

// === ROLE → Image filename ===
const ROLE_IMAGE_MAP: Record<Role, string> = {
  FORENSIC: 'role_lab.jpg',
  MURDERER: 'role_murderer.jpg',
  ACCOMPLICE: 'role_accomplice.jpg',
  WITNESS: 'role_witness.jpg',
  INVESTIGATOR: 'role_investigator.jpg',
};

// === Public API ===

export function getMeansCardImage(cardId: string): string {
  const filename = MEANS_IMAGE_MAP[cardId];
  return filename ? `assets/blue_card/${filename}` : 'assets/blue_card/blue_card_back.jpg';
}

export function getMeansCardBack(): string {
  return 'assets/blue_card/blue_card_back.jpg';
}

export function getClueCardImage(cardId: string): string {
  const filename = CLUE_IMAGE_MAP[cardId];
  return filename ? `assets/red_card/${filename}` : 'assets/event_card/red_card_back.jpg';
}

export function getClueCardBack(): string {
  return 'assets/event_card/red_card_back.jpg';
}

export function getEventCardImage(eventType: EventType): string {
  return `assets/event_card/${EVENT_IMAGE_MAP[eventType]}`;
}

export function getRoleCardImage(role: Role): string {
  return `assets/role_card/${ROLE_IMAGE_MAP[role]}`;
}

export function getRoleCardBack(): string {
  return 'assets/role_card/role_back.jpg';
}

export function getTokenImage(): string {
  return 'assets/token/Tokens x12.jpg';
}

export function getTileCategoryColor(category: TileCategory): string {
  switch (category) {
    case 'LOCATION': return 'bg-green-900/60 border-green-500';
    case 'CAUSE': return 'bg-purple-900/60 border-purple-500';
    case 'CLUE': return 'bg-amber-900/60 border-amber-500';
  }
}

export function getTileCategoryLabel(category: TileCategory): string {
  switch (category) {
    case 'LOCATION': return 'Địa điểm';
    case 'CAUSE': return 'Nguyên nhân';
    case 'CLUE': return 'Manh mối';
  }
}

export function getRoleLabel(role: Role): string {
  switch (role) {
    case 'FORENSIC': return 'Pháp y';
    case 'MURDERER': return 'Sát nhân';
    case 'ACCOMPLICE': return 'Đồng phạm';
    case 'WITNESS': return 'Nhân chứng';
    case 'INVESTIGATOR': return 'Điều tra viên';
  }
}

export function getRoleColor(role: Role): string {
  switch (role) {
    case 'FORENSIC': return 'text-blue-400';
    case 'MURDERER': return 'text-red-500';
    case 'ACCOMPLICE': return 'text-red-400';
    case 'WITNESS': return 'text-yellow-400';
    case 'INVESTIGATOR': return 'text-gray-300';
  }
}
