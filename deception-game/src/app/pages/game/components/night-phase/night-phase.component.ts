import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { Game, Player, GameState } from '../../../../core/models/game.model';
import { getMeansCardImage, getMeansCardBack, getClueCardImage, getClueCardBack, getRoleLabel } from '../../utils/card-images';

@Component({
  selector: 'app-night-phase',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="fixed inset-0 z-40 flex items-center justify-center spotlight overflow-y-auto">
      <div class="w-full max-w-5xl mx-auto px-4 py-8">

        <!-- Waiting screen for non-active players -->
        @if (!isActiveInPhase()) {
          <div class="flex flex-col items-center gap-6 fade-in">
            <div class="text-6xl moon-glow">🌙</div>
            <h2 class="text-2xl font-bold text-blue-200">Đêm xuống...</h2>
            <p class="text-gray-400">{{ getWaitingMessage() }}</p>
          </div>
        }

        <!-- NIGHT_EVIL_DISCUSS: Both evil players see each other's full hand -->
        @else if (game.state === 'NIGHT_EVIL_DISCUSS') {
          <div class="flex flex-col items-center gap-4 fade-in">
            <h2 class="text-2xl font-bold text-red-400">Thảo luận phe ác</h2>
            <p class="text-gray-400 text-sm">Cả hai có 60 giây để bàn bạc chiến thuật</p>

            <!-- Both players' cards side by side -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <!-- Your cards -->
              <div class="glass rounded-xl p-4">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-sm font-bold text-white">
                    {{ player.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-white font-bold text-sm">{{ player.name }} <span class="text-gray-500">(bạn)</span></p>
                    <p class="text-xs font-semibold" [class]="player.role === 'MURDERER' ? 'text-red-500' : 'text-red-400'">
                      {{ getRoleLabel(player.role!) }}
                    </p>
                  </div>
                </div>
                <p class="text-xs text-blue-400 mb-1">Hung khí</p>
                <div class="flex gap-1.5 flex-wrap mb-2">
                  @for (card of player.hand.means; track card.id) {
                    <app-card
                      [frontImage]="getMeansCardImage(card.id)"
                      [backImage]="getMeansCardBack()"
                      [flipped]="false"
                      [width]="70" [height]="98"
                      [label]="card.name">
                    </app-card>
                  }
                </div>
                <p class="text-xs text-red-400 mb-1">Manh mối</p>
                <div class="flex gap-1.5 flex-wrap">
                  @for (card of player.hand.clues; track card.id) {
                    <app-card
                      [frontImage]="getClueCardImage(card.id)"
                      [backImage]="getClueCardBack()"
                      [flipped]="false"
                      [width]="70" [height]="98"
                      [label]="card.name">
                    </app-card>
                  }
                </div>
              </div>

              <!-- Partner's cards -->
              @if (partnerPlayer) {
                <div class="glass rounded-xl p-4">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold text-white">
                      {{ partnerPlayer!.name.charAt(0) }}
                    </div>
                    <div>
                      <p class="text-white font-bold text-sm">{{ partnerPlayer!.name }}</p>
                      <p class="text-xs font-semibold" [class]="partnerPlayer!.role === 'MURDERER' ? 'text-red-500' : 'text-red-400'">
                        {{ getRoleLabel(partnerPlayer!.role!) }}
                      </p>
                    </div>
                  </div>
                  @if (partnerPlayer.hand) {
                    <p class="text-xs text-blue-400 mb-1">Hung khí</p>
                    <div class="flex gap-1.5 flex-wrap mb-2">
                      @for (card of partnerPlayer!.hand.means; track card.id) {
                        <app-card
                          [frontImage]="getMeansCardImage(card.id)"
                          [backImage]="getMeansCardBack()"
                          [flipped]="false"
                          [width]="70" [height]="98"
                          [label]="card.name">
                        </app-card>
                      }
                    </div>
                    <p class="text-xs text-red-400 mb-1">Manh mối</p>
                    <div class="flex gap-1.5 flex-wrap">
                      @for (card of partnerPlayer!.hand.clues; track card.id) {
                        <app-card
                          [frontImage]="getClueCardImage(card.id)"
                          [backImage]="getClueCardBack()"
                          [flipped]="false"
                          [width]="70" [height]="98"
                          [label]="card.name">
                        </app-card>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- NIGHT_EVIL_CHOOSE_CARDS: BOTH murderer AND accomplice select cards -->
        @else if (game.state === 'NIGHT_EVIL_CHOOSE_CARDS') {
          <div class="flex flex-col items-center gap-4 fade-in">
            <h2 class="text-2xl font-bold text-red-400">
              {{ player.role === 'MURDERER' ? 'Chọn bằng chứng thật' : 'Chọn bộ mồi nhử' }}
            </h2>
            <p class="text-gray-400 text-sm">
              {{ player.role === 'MURDERER'
                ? 'Chọn 1 Hung khí + 1 Manh mối từ bài của bạn làm bằng chứng thật'
                : 'Chọn 1 Hung khí + 1 Manh mối từ bài của bạn. Nếu bị buộc tội trúng → phe ác thắng!' }}
            </p>

            <!-- Both players' full cards visible -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <!-- Your cards (selectable) -->
              <div class="glass rounded-xl p-4 border border-red-500/30">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-sm font-bold text-white">
                    {{ player.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-white font-bold text-sm">{{ player.name }} <span class="text-gray-500">(bạn)</span></p>
                    <p class="text-xs text-red-400">Chọn bài của bạn bên dưới</p>
                  </div>
                </div>
                <p class="text-xs text-blue-400 mb-1">Hung khí (chọn 1)</p>
                <div class="flex gap-1.5 flex-wrap mb-2">
                  @for (card of player.hand.means; track card.id) {
                    <app-card
                      [frontImage]="getMeansCardImage(card.id)"
                      [backImage]="getMeansCardBack()"
                      [flipped]="false"
                      [selected]="selectedMeans === card.id"
                      [width]="75" [height]="105"
                      [label]="card.name"
                      (cardClick)="selectMeans(card.id)">
                    </app-card>
                  }
                </div>
                <p class="text-xs text-red-400 mb-1">Manh mối (chọn 1)</p>
                <div class="flex gap-1.5 flex-wrap">
                  @for (card of player.hand.clues; track card.id) {
                    <app-card
                      [frontImage]="getClueCardImage(card.id)"
                      [backImage]="getClueCardBack()"
                      [flipped]="false"
                      [selected]="selectedClue === card.id"
                      [width]="75" [height]="105"
                      [label]="card.name"
                      (cardClick)="selectClue(card.id)">
                    </app-card>
                  }
                </div>
              </div>

              <!-- Partner's cards (view only, with real-time glow) -->
              @if (partnerPlayer?.hand) {
                <div class="glass rounded-xl p-4">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold text-white">
                      {{ partnerPlayer!.name.charAt(0) }}
                    </div>
                    <div>
                      <p class="text-white font-bold text-sm">{{ partnerPlayer!.name }}</p>
                      <p class="text-xs text-gray-500">{{ getRoleLabel(partnerPlayer!.role!) }}</p>
                    </div>
                  </div>
                  <p class="text-xs text-blue-400 mb-1">Hung khí</p>
                  <div class="flex gap-1.5 flex-wrap mb-2">
                    @for (card of partnerPlayer!.hand.means; track card.id) {
                      <app-card
                        [frontImage]="getMeansCardImage(card.id)"
                        [backImage]="getMeansCardBack()"
                        [flipped]="false"
                        [partnerSelected]="partnerSelectedMeans === card.id"
                        [width]="75" [height]="105"
                        [label]="card.name">
                      </app-card>
                    }
                  </div>
                  <p class="text-xs text-red-400 mb-1">Manh mối</p>
                  <div class="flex gap-1.5 flex-wrap">
                    @for (card of partnerPlayer!.hand.clues; track card.id) {
                      <app-card
                        [frontImage]="getClueCardImage(card.id)"
                        [backImage]="getClueCardBack()"
                        [flipped]="false"
                        [partnerSelected]="partnerSelectedClue === card.id"
                        [width]="75" [height]="105"
                        [label]="card.name">
                      </app-card>
                    }
                  </div>
                </div>
              }
            </div>

            <button (click)="confirmChoice()"
                    [disabled]="!selectedMeans || !selectedClue"
                    class="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500
                           text-white font-semibold rounded-lg transition-colors mt-2">
              {{ player.role === 'MURDERER' ? 'Xác nhận bằng chứng thật' : 'Xác nhận bộ mồi nhử' }}
            </button>
          </div>
        }

        <!-- NIGHT_WITNESS_REVEAL: Witness sees evil identities -->
        @else if (game.state === 'NIGHT_WITNESS_REVEAL') {
          <div class="flex flex-col items-center gap-6 fade-in">
            <h2 class="text-2xl font-bold text-yellow-400">Nhận diện phe ác</h2>
            <p class="text-gray-400 text-sm">Bạn là Nhân chứng. Ghi nhớ những người sau:</p>

            <div class="flex gap-4">
              @for (evilId of getWitnessViewIds(); track evilId) {
                <div class="glass rounded-xl p-4 text-center">
                  <div class="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-2">
                    {{ getPlayerName(evilId).charAt(0) }}
                  </div>
                  <p class="text-red-400 font-bold">{{ getPlayerName(evilId) }}</p>
                  <p class="text-gray-500 text-xs">Phe ác</p>
                </div>
              }
            </div>

            <button (click)="witnessAck.emit()"
                    class="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors">
              Đã ghi nhớ
            </button>
          </div>
        }

        <!-- NIGHT_FORENSIC_REVEAL: Forensic sees all info -->
        @else if (game.state === 'NIGHT_FORENSIC_REVEAL') {
          <div class="flex flex-col items-center gap-4 fade-in">
            <h2 class="text-2xl font-bold text-blue-400">Thông tin pháp y</h2>
            <p class="text-gray-400 text-sm">Bạn biết sự thật. Hãy dẫn dắt điều tra viên qua bảng hiện trường.</p>

            @if (forensicView) {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <!-- Murderer info -->
                <div class="glass rounded-xl p-4">
                  <p class="text-red-500 font-bold text-sm mb-3">🔪 Sát nhân: {{ getPlayerName(forensicView.murdererId) }}</p>
                  @if (forensicView.murdererHand) {
                    <p class="text-xs text-blue-400 mb-1">Hung khí
                      @if (forensicView.murdererTrueMeans) {
                        <span class="text-gray-500">· đã chọn: </span><span class="text-blue-300 font-semibold">{{ getCardName(forensicView.murdererTrueMeans, 'means') }}</span>
                      }
                    </p>
                    <div class="flex gap-1.5 flex-wrap mb-3">
                      @for (card of forensicView.murdererHand.means; track card.id) {
                        <app-card
                          [frontImage]="getMeansCardImage(card.id)"
                          [backImage]="getMeansCardBack()"
                          [flipped]="false"
                          [selected]="card.id === forensicView.murdererTrueMeans"
                          [width]="70" [height]="98"
                          [label]="card.name">
                        </app-card>
                      }
                    </div>
                    <p class="text-xs text-red-400 mb-1">Manh mối
                      @if (forensicView.murdererTrueClue) {
                        <span class="text-gray-500">· đã chọn: </span><span class="text-red-300 font-semibold">{{ getCardName(forensicView.murdererTrueClue, 'clue') }}</span>
                      }
                    </p>
                    <div class="flex gap-1.5 flex-wrap">
                      @for (card of forensicView.murdererHand.clues; track card.id) {
                        <app-card
                          [frontImage]="getClueCardImage(card.id)"
                          [backImage]="getClueCardBack()"
                          [flipped]="false"
                          [selected]="card.id === forensicView.murdererTrueClue"
                          [width]="70" [height]="98"
                          [label]="card.name">
                        </app-card>
                      }
                    </div>
                  }
                </div>
                <!-- Accomplice info -->
                @if (forensicView.accompliceId) {
                  <div class="glass rounded-xl p-4">
                    <p class="text-red-400 font-bold text-sm mb-3">🤝 Đồng phạm: {{ getPlayerName(forensicView.accompliceId) }}</p>
                    @if (forensicView.accompliceHand) {
                      <p class="text-xs text-blue-400 mb-1">Hung khí
                        @if (forensicView.accompliceTrueMeans) {
                          <span class="text-gray-500">· đã chọn: </span><span class="text-blue-300 font-semibold">{{ getAccompliceCardName(forensicView.accompliceTrueMeans, 'means') }}</span>
                        }
                      </p>
                      <div class="flex gap-1.5 flex-wrap mb-3">
                        @for (card of forensicView.accompliceHand.means; track card.id) {
                          <app-card
                            [frontImage]="getMeansCardImage(card.id)"
                            [backImage]="getMeansCardBack()"
                            [flipped]="false"
                            [selected]="card.id === forensicView.accompliceTrueMeans"
                            [width]="70" [height]="98"
                            [label]="card.name">
                          </app-card>
                        }
                      </div>
                      <p class="text-xs text-red-400 mb-1">Manh mối
                        @if (forensicView.accompliceTrueClue) {
                          <span class="text-gray-500">· đã chọn: </span><span class="text-red-300 font-semibold">{{ getAccompliceCardName(forensicView.accompliceTrueClue, 'clue') }}</span>
                        }
                      </p>
                      <div class="flex gap-1.5 flex-wrap">
                        @for (card of forensicView.accompliceHand.clues; track card.id) {
                          <app-card
                            [frontImage]="getClueCardImage(card.id)"
                            [backImage]="getClueCardBack()"
                            [flipped]="false"
                            [selected]="card.id === forensicView.accompliceTrueClue"
                            [width]="70" [height]="98"
                            [label]="card.name">
                          </app-card>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <button (click)="forensicAck.emit()"
                    class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              Bắt đầu điều tra
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class NightPhaseComponent {
  @Input() game!: Game;
  @Input() player!: Player;
  @Input() partnerPlayer: Player | null = null;
  @Input() forensicView: any = null;
  @Input() witnessView: any = null;

  @Input() partnerSelectedMeans: string | null = null;
  @Input() partnerSelectedClue: string | null = null;

  @Output() chooseCards = new EventEmitter<{ meansId: string; clueId: string }>();
  @Output() selectingCard = new EventEmitter<{ meansId: string | null; clueId: string | null }>();
  @Output() witnessAck = new EventEmitter<void>();
  @Output() forensicAck = new EventEmitter<void>();

  selectedMeans: string | null = null;
  selectedClue: string | null = null;

  getMeansCardImage = getMeansCardImage;
  getMeansCardBack = getMeansCardBack;
  getClueCardImage = getClueCardImage;
  getClueCardBack = getClueCardBack;
  getRoleLabel = getRoleLabel;

  isActiveInPhase(): boolean {
    const state = this.game.state;
    const role = this.player.role;
    if (state === 'NIGHT_EVIL_DISCUSS' || state === 'NIGHT_EVIL_CHOOSE_CARDS') {
      return role === 'MURDERER' || role === 'ACCOMPLICE';
    }
    if (state === 'NIGHT_WITNESS_REVEAL') return role === 'WITNESS';
    if (state === 'NIGHT_FORENSIC_REVEAL') return role === 'FORENSIC';
    return false;
  }

  getWaitingMessage(): string {
    switch (this.game.state) {
      case 'NIGHT_EVIL_DISCUSS': return 'Phe ác đang thảo luận...';
      case 'NIGHT_EVIL_CHOOSE_CARDS': return 'Phe ác đang chọn bằng chứng...';
      case 'NIGHT_WITNESS_REVEAL': return 'Nhân chứng đang xác nhận...';
      case 'NIGHT_FORENSIC_REVEAL': return 'Pháp y đang xem xét bằng chứng...';
      default: return 'Đang chờ...';
    }
  }

  selectMeans(id: string): void {
    this.selectedMeans = this.selectedMeans === id ? null : id;
    this.selectingCard.emit({ meansId: this.selectedMeans, clueId: this.selectedClue });
  }

  selectClue(id: string): void {
    this.selectedClue = this.selectedClue === id ? null : id;
    this.selectingCard.emit({ meansId: this.selectedMeans, clueId: this.selectedClue });
  }

  confirmChoice(): void {
    if (this.selectedMeans && this.selectedClue) {
      this.chooseCards.emit({ meansId: this.selectedMeans, clueId: this.selectedClue });
    }
  }

  getWitnessViewIds(): string[] {
    if (!this.witnessView) return [];
    const ids: string[] = [];
    if (this.witnessView.murdererId) ids.push(this.witnessView.murdererId);
    if (this.witnessView.accompliceId) ids.push(this.witnessView.accompliceId);
    return ids;
  }

  getPlayerName(id: string): string {
    return this.game.players.find(p => p.id === id)?.name || '???';
  }

  getCardName(cardId: string, type: 'means' | 'clue'): string {
    const player = this.game.players.find(p => p.role === 'MURDERER');
    if (!player) return cardId;
    const cards = type === 'means' ? player.hand.means : player.hand.clues;
    return cards.find(c => c.id === cardId)?.name || cardId;
  }

  getAccompliceCardName(cardId: string, type: 'means' | 'clue'): string {
    const player = this.game.players.find(p => p.role === 'ACCOMPLICE');
    if (!player) return cardId;
    const cards = type === 'means' ? player.hand.means : player.hand.clues;
    return cards.find(c => c.id === cardId)?.name || cardId;
  }
}
