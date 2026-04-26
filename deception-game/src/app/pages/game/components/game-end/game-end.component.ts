import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game, Player, GameResult, Role } from '../../../../core/models/game.model';
import { getRoleLabel, getRoleColor, getMeansCardImage, getClueCardImage } from '../../utils/card-images';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-game-end',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
         [class]="isGoodWin ? 'bg-gradient-to-b from-green-900/90 to-gray-900' : 'bg-gradient-to-b from-red-900/90 to-gray-900'">

      <!-- Confetti for good win -->
      @if (isGoodWin) {
        @for (i of confettiPieces; track i) {
          <div class="confetti-piece rounded-sm"
               [style.left.%]="i * 7"
               [style.animation-delay.ms]="i * 200"
               [style.background-color]="confettiColors[i % confettiColors.length]">
          </div>
        }
      }

      <div class="w-full max-w-3xl mx-auto px-4 py-8">
        <!-- Winner announcement -->
        <div class="text-center mb-8 float-up">
          <div class="text-6xl mb-4">{{ isGoodWin ? '🎉' : '💀' }}</div>
          <h1 class="text-4xl font-bold mb-2"
              [class]="isGoodWin ? 'text-green-400' : 'text-red-500'">
            {{ isGoodWin ? 'Phe thiện thắng!' : 'Phe ác thắng!' }}
          </h1>
          <p class="text-gray-400 text-lg">{{ getEndReasonText() }}</p>
        </div>

        <!-- True evidence -->
        @if (gameResult?.trueEvidence) {
          <div class="glass rounded-xl p-4 mb-6 text-center slide-up">
            <h3 class="text-sm font-semibold text-gray-400 mb-3">Bằng chứng thật</h3>
            <div class="flex justify-center gap-6">
              <div>
                <app-card
                  [frontImage]="getMeansCardImage(gameResult!.trueEvidence.meansId)"
                  [backImage]="''"
                  [flipped]="false"
                  [width]="100" [height]="140">
                </app-card>
                <p class="text-xs text-blue-400 mt-1">Hung khí</p>
              </div>
              <div>
                <app-card
                  [frontImage]="getClueCardImage(gameResult!.trueEvidence.clueId)"
                  [backImage]="''"
                  [flipped]="false"
                  [width]="100" [height]="140">
                </app-card>
                <p class="text-xs text-red-400 mt-1">Manh mối</p>
              </div>
            </div>
          </div>
        }

        <!-- Role reveal -->
        <div class="glass rounded-xl p-4 mb-6 slide-up">
          <h3 class="text-sm font-semibold text-gray-400 mb-3 text-center">Vai trò</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            @for (p of game.players; track p.id) {
              <div class="flex items-center gap-2 p-2 rounded-lg"
                   [class]="p.id === player.id ? 'bg-white/5' : ''">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                     [class]="getAvatarBg(getPlayerRole(p.id))">
                  {{ p.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm text-white font-medium">{{ p.name }}</p>
                  <p class="text-xs font-semibold" [class]="getRoleColor(getPlayerRole(p.id))">
                    {{ getRoleLabel(getPlayerRole(p.id)) }}
                  </p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Back to lobby -->
        <div class="text-center">
          <button (click)="backToLobby.emit()"
                  class="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
            Về sảnh chờ
          </button>
        </div>
      </div>
    </div>
  `,
})
export class GameEndComponent implements OnInit {
  @Input() game!: Game;
  @Input() player!: Player;
  @Input() gameResult: GameResult | null = null;

  @Output() backToLobby = new EventEmitter<void>();

  getRoleLabel = getRoleLabel;
  getRoleColor = getRoleColor;
  getMeansCardImage = getMeansCardImage;
  getClueCardImage = getClueCardImage;

  confettiPieces = Array.from({ length: 15 }, (_, i) => i);
  confettiColors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];

  get isGoodWin(): boolean {
    return this.gameResult?.winner === 'GOOD';
  }

  ngOnInit(): void {}

  getPlayerRole(id: string): Role {
    if (this.gameResult?.revealedRoles?.[id]) {
      return this.gameResult.revealedRoles[id];
    }
    return this.game.players.find(p => p.id === id)?.role || 'INVESTIGATOR';
  }

  getAvatarBg(role: Role): string {
    switch (role) {
      case 'FORENSIC': return 'bg-blue-600 text-blue-100';
      case 'MURDERER': return 'bg-red-700 text-red-100';
      case 'ACCOMPLICE': return 'bg-red-600 text-red-100';
      case 'WITNESS': return 'bg-yellow-600 text-yellow-100';
      case 'INVESTIGATOR': return 'bg-gray-600 text-gray-300';
    }
  }

  getEndReasonText(): string {
    if (!this.gameResult) return '';
    switch (this.gameResult.reason) {
      case 'CORRECT_ACCUSATION_NO_WITNESS': return 'Điều tra viên đã tìm ra Sát nhân!';
      case 'WITNESS_HUNTED': return 'Sát nhân đã tìm thấy Nhân chứng!';
      case 'WITNESS_SAFE': return 'Nhân chứng đã an toàn! Phe thiện thắng!';
      case 'ACCOMPLICE_FRAMED': return 'Đồng phạm bị buộc tội thay! Phe ác thắng!';
      case 'ALL_BADGES_USED': return 'Hết huy hiệu! Phe ác thắng!';
      case 'ROUNDS_EXHAUSTED': return 'Hết 3 vòng! Phe ác thắng!';
      case 'COUNTDOWN_EVENT': return 'Hết giờ đếm ngược! Phe ác thắng!';
      default: return '';
    }
  }
}
