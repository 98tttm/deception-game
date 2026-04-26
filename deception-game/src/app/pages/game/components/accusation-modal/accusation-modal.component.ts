import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { Game, Player, MeansCard, ClueCard } from '../../../../core/models/game.model';
import { getMeansCardImage, getMeansCardBack, getClueCardImage, getClueCardBack } from '../../utils/card-images';

@Component({
  selector: 'app-accusation-modal',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80" (click)="onBackdrop($event)">
      <div class="glass rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto slide-up"
           (click)="$event.stopPropagation()">

        <!-- Step indicator -->
        <div class="flex items-center justify-center gap-2 mb-6">
          @for (s of [1,2,3]; track s) {
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                   [class]="step >= s ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-500'">
                {{ s }}
              </div>
              @if (s < 3) {
                <div class="w-8 h-0.5" [class]="step > s ? 'bg-red-600' : 'bg-gray-700'"></div>
              }
            </div>
          }
        </div>

        <!-- Step 1: Select target player -->
        @if (step === 1) {
          <h3 class="text-lg font-bold text-red-400 text-center mb-4">Chọn nghi phạm</h3>
          <div class="grid grid-cols-3 gap-3">
            @for (p of getAccusableTargets(); track p.id) {
              <button (click)="selectTarget(p)"
                      class="p-3 rounded-xl border transition-all"
                      [class]="selectedTarget?.id === p.id
                        ? 'border-red-500 bg-red-900/30'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-500'">
                <div class="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-lg font-bold text-gray-300 mx-auto mb-2">
                  {{ p.name.charAt(0).toUpperCase() }}
                </div>
                <p class="text-sm text-center text-gray-300 truncate">{{ p.name }}</p>
              </button>
            }
          </div>
          <div class="flex justify-between mt-4">
            <button (click)="cancel.emit()" class="px-4 py-2 text-gray-400 hover:text-white text-sm">Hủy</button>
            <button (click)="step = 2" [disabled]="!selectedTarget"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded-lg">
              Tiếp
            </button>
          </div>
        }

        <!-- Step 2: Select means card from target -->
        @else if (step === 2) {
          <h3 class="text-lg font-bold text-blue-400 text-center mb-2">Chọn Hung khí của {{ selectedTarget!.name }}</h3>
          <p class="text-gray-500 text-xs text-center mb-4">Bạn nghĩ hung thủ dùng vũ khí nào?</p>
          <div class="flex gap-2 justify-center flex-wrap">
            @for (card of selectedTarget!.hand.means; track card.id) {
              <div (click)="selectMeans(card)"
                   class="cursor-pointer transition-transform"
                   [class.scale-110]="selectedMeans?.id === card.id">
                <app-card
                  [frontImage]="card.id === '?' ? getMeansCardBack() : getMeansCardImage(card.id)"
                  [backImage]="getMeansCardBack()"
                  [flipped]="false"
                  [selected]="selectedMeans?.id === card.id"
                  [width]="90" [height]="126"
                  [label]="card.name">
                </app-card>
                <p class="text-xs text-center text-gray-400 mt-1 truncate max-w-[90px]">{{ card.name }}</p>
              </div>
            }
          </div>
          <div class="flex justify-between mt-4">
            <button (click)="step = 1" class="px-4 py-2 text-gray-400 hover:text-white text-sm">Quay lại</button>
            <button (click)="step = 3" [disabled]="!selectedMeans"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded-lg">
              Tiếp
            </button>
          </div>
        }

        <!-- Step 3: Select clue card from target + confirm -->
        @else if (step === 3) {
          <h3 class="text-lg font-bold text-red-400 text-center mb-2">Chọn Manh mối của {{ selectedTarget!.name }}</h3>
          <p class="text-gray-500 text-xs text-center mb-4">Bạn nghĩ manh mối nào là thật?</p>
          <div class="flex gap-2 justify-center flex-wrap">
            @for (card of selectedTarget!.hand.clues; track card.id) {
              <div (click)="selectClue(card)"
                   class="cursor-pointer transition-transform"
                   [class.scale-110]="selectedClue?.id === card.id">
                <app-card
                  [frontImage]="card.id === '?' ? getClueCardBack() : getClueCardImage(card.id)"
                  [backImage]="getClueCardBack()"
                  [flipped]="false"
                  [selected]="selectedClue?.id === card.id"
                  [width]="90" [height]="126"
                  [label]="card.name">
                </app-card>
                <p class="text-xs text-center text-gray-400 mt-1 truncate max-w-[90px]">{{ card.name }}</p>
              </div>
            }
          </div>
          <div class="flex justify-between mt-4">
            <button (click)="step = 2" class="px-4 py-2 text-gray-400 hover:text-white text-sm">Quay lại</button>
            <button (click)="confirmAccusation()" [disabled]="!selectedClue"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-bold rounded-lg">
              ⚖️ Buộc tội!
            </button>
          </div>
        }

        <!-- Result -->
        @if (result) {
          <div class="fixed inset-0 z-60 flex items-center justify-center bg-black/80">
            <div class="text-center" [class]="result === 'CORRECT' ? '' : 'shake'">
              <div class="text-6xl mb-4 badge-slam">
                {{ result === 'CORRECT' ? '✅' : '❌' }}
              </div>
              <h3 class="text-2xl font-bold"
                  [class]="result === 'CORRECT' ? 'text-green-400' : 'text-red-400'">
                {{ result === 'CORRECT' ? 'Chính xác!' : result === 'ACCOMPLICE_FRAMED' ? 'Buộc tội nhầm Đồng phạm!' : 'Sai rồi!' }}
              </h3>
              <p class="text-gray-400 text-sm mt-2">
                {{ result === 'CORRECT' ? 'Bạn đã tìm ra Sát nhân!' : 'Mất 1 huy hiệu.' }}
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AccusationModalComponent {
  @Input() game!: Game;
  @Input() player!: Player;
  @Input() result: string | null = null;

  @Output() accuse = new EventEmitter<{ targetId: string; meansCardId: string; clueCardId: string }>();
  @Output() cancel = new EventEmitter<void>();

  step = 1;
  selectedTarget: Player | null = null;
  selectedMeans: MeansCard | null = null;
  selectedClue: ClueCard | null = null;

  getMeansCardImage = getMeansCardImage;
  getMeansCardBack = getMeansCardBack;
  getClueCardImage = getClueCardImage;
  getClueCardBack = getClueCardBack;

  getAccusableTargets(): Player[] {
    return this.game.players.filter(p =>
      p.id !== this.player.id && p.role !== 'FORENSIC'
    );
  }

  selectTarget(p: Player): void {
    this.selectedTarget = p;
    this.selectedMeans = null;
    this.selectedClue = null;
  }

  selectMeans(card: MeansCard): void {
    this.selectedMeans = this.selectedMeans?.id === card.id ? null : card;
  }

  selectClue(card: ClueCard): void {
    this.selectedClue = this.selectedClue?.id === card.id ? null : card;
  }

  confirmAccusation(): void {
    if (this.selectedTarget && this.selectedMeans && this.selectedClue) {
      this.accuse.emit({
        targetId: this.selectedTarget.id,
        meansCardId: this.selectedMeans.id,
        clueCardId: this.selectedClue.id,
      });
    }
  }

  onBackdrop(event: MouseEvent): void {
    this.cancel.emit();
  }
}
