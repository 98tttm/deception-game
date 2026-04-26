import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { Game, Player, EventType } from '../../../../core/models/game.model';
import { getEventCardImage, getClueCardBack } from '../../utils/card-images';

@Component({
  selector: 'app-event-resolver',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div class="glass rounded-2xl p-6 max-w-lg w-full mx-4 slide-up">
        <!-- Event card reveal -->
        <div class="flex justify-center mb-4">
          <app-card
            [frontImage]="getEventCardImage(eventType)"
            [backImage]="getClueCardBack()"
            [flipped]="!revealed"
            [width]="160" [height]="224"
            [label]="getEventName()"
            (cardClick)="revealed = true">
          </app-card>
        </div>

        @if (revealed) {
          <h3 class="text-lg font-bold text-center mb-2" [class]="getEventColor()">
            {{ getEventName() }}
          </h3>
          <p class="text-gray-400 text-sm text-center mb-4">{{ getEventDescription() }}</p>

          <!-- COUNTDOWN -->
          @if (eventType === 'COUNTDOWN') {
            <div class="text-center">
              <div class="text-4xl text-red-500 font-bold animate-pulse mb-2">⏰</div>
              <p class="text-red-400 text-sm">Nếu không tìm ra Sát nhân trong vòng này, phe ác thắng!</p>
            </div>
          }

          <!-- A_GOOD_TWIST -->
          @else if (eventType === 'A_GOOD_TWIST') {
            <div class="text-center">
              <div class="text-4xl mb-2 badge-slam">🎖️</div>
              <p class="text-green-400 text-sm">Tất cả điều tra viên nhận thêm 1 huy hiệu!</p>
            </div>
          }

          <!-- RULED_OUT_EVIDENCE -->
          @else if (eventType === 'RULED_OUT_EVIDENCE') {
            <div class="text-center">
              <p class="text-amber-400 text-sm mb-3">Mỗi người chơi phải lật úp 1 lá manh mối</p>
              @if (canAct) {
                <div class="flex gap-2 justify-center flex-wrap">
                  @for (card of getFlippableClues(); track card.id) {
                    <button (click)="selectFlipCard(card.id)"
                            class="px-3 py-2 rounded-lg border text-sm transition-all"
                            [class]="selectedFlipId === card.id
                              ? 'border-amber-500 bg-amber-900/30 text-amber-300'
                              : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'">
                      {{ card.name }}
                    </button>
                  }
                </div>
                <button (click)="confirmFlip()"
                        [disabled]="!selectedFlipId"
                        class="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700
                               disabled:text-gray-500 text-white text-sm rounded-lg">
                  Xác nhận
                </button>
              }
            </div>
          }

          <!-- SECRET_TESTIMONY -->
          @else if (eventType === 'SECRET_TESTIMONY') {
            <div class="text-center">
              <p class="text-purple-400 text-sm">Nhân chứng có thể bí mật chọn 1 manh mối gợi ý</p>
              @if (player.role === 'WITNESS' && canAct) {
                <p class="text-gray-500 text-xs mt-2">(Tính năng đang phát triển)</p>
              }
            </div>
          }

          <!-- ERRONEOUS_INFORMATION -->
          @else if (eventType === 'ERRONEOUS_INFORMATION') {
            <div class="text-center">
              <p class="text-orange-400 text-sm">Pháp y phải di chuyển 1 dấu sang vị trí khác</p>
              @if (player.role === 'FORENSIC' && canAct) {
                <p class="text-gray-500 text-xs mt-2">Đặt lại dấu trên bảng hiện trường</p>
              }
            </div>
          }

          <!-- A_USEFUL_CLUE -->
          @else if (eventType === 'A_USEFUL_CLUE') {
            <div class="text-center">
              <p class="text-blue-400 text-sm">Pháp y được chọn thêm 1 bảng manh mối mới</p>
            </div>
          }

          @if (!canAct || eventType === 'COUNTDOWN' || eventType === 'A_GOOD_TWIST') {
            <div class="text-center mt-4">
              <button (click)="acknowledge.emit()"
                      class="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg">
                Đã hiểu
              </button>
            </div>
          }
        } @else {
          <p class="text-gray-500 text-sm text-center animate-pulse">Nhấn vào lá bài để lật</p>
        }
      </div>
    </div>
  `,
})
export class EventResolverComponent {
  @Input() game!: Game;
  @Input() player!: Player;
  @Input() eventType!: EventType;
  @Input() canAct = false;

  @Output() acknowledge = new EventEmitter<void>();
  @Output() flipClue = new EventEmitter<string>();

  revealed = false;
  selectedFlipId: string | null = null;

  getEventCardImage = getEventCardImage;
  getClueCardBack = getClueCardBack;

  getEventName(): string {
    const names: Record<EventType, string> = {
      COUNTDOWN: 'Đếm ngược',
      SECRET_TESTIMONY: 'Lời khai bí mật',
      ERRONEOUS_INFORMATION: 'Thông tin sai lệch',
      RULED_OUT_EVIDENCE: 'Loại trừ vật chứng',
      A_GOOD_TWIST: 'Bước ngoặt bất ngờ',
      A_USEFUL_CLUE: 'Manh mối hữu ích',
    };
    return names[this.eventType] || this.eventType;
  }

  getEventColor(): string {
    switch (this.eventType) {
      case 'COUNTDOWN': return 'text-red-500';
      case 'A_GOOD_TWIST': return 'text-green-400';
      case 'RULED_OUT_EVIDENCE': return 'text-amber-400';
      case 'SECRET_TESTIMONY': return 'text-purple-400';
      case 'ERRONEOUS_INFORMATION': return 'text-orange-400';
      case 'A_USEFUL_CLUE': return 'text-blue-400';
      default: return 'text-white';
    }
  }

  getEventDescription(): string {
    switch (this.eventType) {
      case 'COUNTDOWN': return 'Thời gian gấp rút! Đây là cơ hội cuối cùng.';
      case 'SECRET_TESTIMONY': return 'Nhân chứng có thể đưa ra lời khai bí mật.';
      case 'ERRONEOUS_INFORMATION': return 'Có thông tin sai lệch! Pháp y phải sửa lại.';
      case 'RULED_OUT_EVIDENCE': return 'Một số vật chứng bị loại trừ.';
      case 'A_GOOD_TWIST': return 'Tin tốt! Tất cả điều tra viên được thêm huy hiệu.';
      case 'A_USEFUL_CLUE': return 'Pháp y có thêm manh mối hữu ích để chia sẻ.';
      default: return '';
    }
  }

  getFlippableClues(): { id: string; name: string }[] {
    return this.player.hand.clues.filter(
      c => c.id !== '?' && !this.player.hand.flippedClues?.includes(c.id)
    );
  }

  selectFlipCard(id: string): void {
    this.selectedFlipId = this.selectedFlipId === id ? null : id;
  }

  confirmFlip(): void {
    if (this.selectedFlipId) {
      this.flipClue.emit(this.selectedFlipId);
    }
  }
}
