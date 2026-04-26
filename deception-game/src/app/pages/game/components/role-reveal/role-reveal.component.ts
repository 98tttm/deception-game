import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { Player } from '../../../../core/models/game.model';
import { getRoleCardImage, getRoleCardBack, getRoleLabel, getRoleColor } from '../../utils/card-images';

@Component({
  selector: 'app-role-reveal',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 vignette-overlay">
      <div class="flex flex-col items-center gap-6 float-up">
        <h2 class="text-gray-400 text-lg tracking-widest uppercase">Vai trò của bạn</h2>

        <!-- Role Card with 3D flip -->
        <div (click)="revealCard()">
          <app-card
            [frontImage]="getRoleCardImage(player.role!)"
            [backImage]="getRoleCardBack()"
            [flipped]="!revealed"
            [width]="220"
            [height]="308"
            [label]="getRoleLabel(player.role!)">
          </app-card>
        </div>

        @if (revealed) {
          <div class="text-center slide-up">
            <h3 class="text-2xl font-bold mb-2" [class]="getRoleColor(player.role!)">
              {{ getRoleLabel(player.role!) }}
            </h3>
            <p class="text-gray-400 text-sm max-w-xs">{{ getRoleDescription(player.role!) }}</p>
          </div>

          <button (click)="confirmed.emit()"
                  class="mt-4 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold
                         rounded-lg transition-colors">
            Đã hiểu
          </button>
        } @else {
          <p class="text-gray-500 text-sm animate-pulse">Nhấn vào lá bài để lật</p>
        }
      </div>
    </div>
  `,
})
export class RoleRevealComponent {
  @Input() player!: Player;
  @Output() confirmed = new EventEmitter<void>();

  revealed = false;

  getRoleCardImage = getRoleCardImage;
  getRoleCardBack = getRoleCardBack;
  getRoleLabel = getRoleLabel;
  getRoleColor = getRoleColor;

  revealCard(): void {
    this.revealed = true;
  }

  getRoleDescription(role: string): string {
    switch (role) {
      case 'FORENSIC':
        return 'Bạn là Pháp y. Bạn biết ai là Sát nhân và vũ khí/manh mối thật. Hãy dẫn dắt điều tra viên bằng cách đặt dấu trên bảng hiện trường. Bạn không được nói chuyện.';
      case 'MURDERER':
        return 'Bạn là Sát nhân. Hãy chọn 1 Hung khí và 1 Manh mối từ bài của bạn làm bằng chứng thật. Đánh lạc hướng các điều tra viên!';
      case 'ACCOMPLICE':
        return 'Bạn là Đồng phạm. Bạn biết ai là Sát nhân. Hãy bảo vệ Sát nhân bằng cách đánh lạc hướng điều tra.';
      case 'WITNESS':
        return 'Bạn là Nhân chứng. Bạn biết ai là Sát nhân và Đồng phạm, nhưng nếu phe thiện thắng, Sát nhân sẽ săn lùng bạn!';
      case 'INVESTIGATOR':
        return 'Bạn là Điều tra viên. Hãy phân tích bảng hiện trường và tìm ra Sát nhân. Bạn có 1 huy hiệu để buộc tội.';
      default:
        return '';
    }
  }
}
