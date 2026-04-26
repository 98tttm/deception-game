import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerBarComponent } from '../timer-bar/timer-bar.component';
import { Game, Player } from '../../../../core/models/game.model';
import { TIMERS } from '../../../../core/models/constants';

@Component({
  selector: 'app-witness-hunt',
  standalone: true,
  imports: [CommonModule, TimerBarComponent],
  template: `
    <div class="fixed inset-0 z-50 spotlight flex items-center justify-center">
      <div class="w-full max-w-2xl mx-auto px-4">
        <div class="text-center mb-6 fade-in">
          <div class="text-5xl mb-3">🔦</div>
          <h2 class="text-3xl font-bold text-red-400 mb-2">Săn nhân chứng</h2>
          <p class="text-gray-400 text-sm">
            {{ isMurderer ? 'Chọn người bạn nghĩ là Nhân chứng!' : isAccomplice ? 'Đồng phạm đang hỗ trợ Sát nhân...' : 'Sát nhân đang tìm Nhân chứng...' }}
          </p>
        </div>

        <!-- Timer -->
        @if (game.witnessHunt?.deadline) {
          <div class="max-w-xs mx-auto mb-6">
            <app-timer-bar
              [totalSeconds]="WITNESS_HUNT_TIME"
              [deadline]="game.witnessHunt!.deadline"
              label="Thời gian săn">
            </app-timer-bar>
          </div>
        }

        <!-- Murderer's selection UI -->
        @if (isMurderer) {
          <div class="grid grid-cols-3 gap-3 max-w-lg mx-auto slide-up">
            @for (p of getHuntableTargets(); track p.id) {
              <button (click)="selectTarget(p.id)"
                      class="p-4 rounded-xl border transition-all"
                      [class]="selectedTargetId === p.id
                        ? 'border-red-500 bg-red-900/40 shadow-lg shadow-red-500/20'
                        : 'border-gray-700 bg-gray-800/60 hover:border-red-500/50'">
                <div class="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-300 mx-auto mb-2">
                  {{ p.name.charAt(0).toUpperCase() }}
                </div>
                <p class="text-sm text-center text-gray-300 truncate">{{ p.name }}</p>
              </button>
            }
          </div>

          <div class="text-center mt-6">
            <button (click)="confirmHunt()"
                    [disabled]="!selectedTargetId"
                    class="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700
                           disabled:text-gray-500 text-white font-bold rounded-lg transition-colors text-lg">
              🎯 Chọn mục tiêu
            </button>
          </div>
        }

        <!-- Result display -->
        @if (game.witnessHunt?.result) {
          <div class="text-center mt-8 fade-in">
            @if (game.witnessHunt!.result === 'WITNESS_FOUND') {
              <div class="text-6xl mb-4">💀</div>
              <h3 class="text-3xl font-bold text-red-500">Nhân chứng đã bị tìm thấy!</h3>
              <p class="text-red-400 mt-2">Phe ác chiến thắng!</p>
            } @else {
              <div class="text-6xl mb-4">🛡️</div>
              <h3 class="text-3xl font-bold text-green-400">Nhân chứng an toàn!</h3>
              <p class="text-green-300 mt-2">Phe thiện chiến thắng!</p>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class WitnessHuntComponent {
  @Input() game!: Game;
  @Input() player!: Player;

  @Output() hunt = new EventEmitter<string>();

  selectedTargetId: string | null = null;
  WITNESS_HUNT_TIME = TIMERS.WITNESS_HUNT;

  get isMurderer(): boolean {
    return this.player.role === 'MURDERER';
  }

  get isAccomplice(): boolean {
    return this.player.role === 'ACCOMPLICE';
  }

  getHuntableTargets(): Player[] {
    return this.game.players.filter(p =>
      p.id !== this.player.id &&
      p.role !== 'FORENSIC' &&
      p.role !== 'MURDERER' &&
      p.role !== 'ACCOMPLICE'
    );
  }

  selectTarget(id: string): void {
    this.selectedTargetId = this.selectedTargetId === id ? null : id;
  }

  confirmHunt(): void {
    if (this.selectedTargetId) {
      this.hunt.emit(this.selectedTargetId);
    }
  }
}
