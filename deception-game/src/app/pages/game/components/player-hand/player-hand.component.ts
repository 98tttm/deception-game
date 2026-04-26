import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { Player } from '../../../../core/models/game.model';
import { getMeansCardImage, getMeansCardBack, getClueCardImage, getClueCardBack } from '../../utils/card-images';

@Component({
  selector: 'app-player-hand',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="space-y-3">
      <!-- Means cards -->
      <div>
        <p class="text-xs text-blue-400 mb-1.5 font-semibold">Hung khí</p>
        <div class="flex gap-2 flex-wrap">
          @for (card of player.hand.means; track card.id) {
            <app-card
              [frontImage]="getMeansCardImage(card.id)"
              [backImage]="getMeansCardBack()"
              [flipped]="card.id === '?'"
              [width]="cardWidth"
              [height]="cardHeight"
              [label]="card.name">
            </app-card>
          }
        </div>
      </div>
      <!-- Clue cards -->
      <div>
        <p class="text-xs text-red-400 mb-1.5 font-semibold">Manh mối</p>
        <div class="flex gap-2 flex-wrap">
          @for (card of player.hand.clues; track card.id) {
            <app-card
              [frontImage]="getClueCardImage(card.id)"
              [backImage]="getClueCardBack()"
              [flipped]="card.id === '?' || isFlipped(card.id)"
              [disabled]="isFlipped(card.id)"
              [width]="cardWidth"
              [height]="cardHeight"
              [label]="card.name">
            </app-card>
          }
        </div>
      </div>
    </div>
  `,
})
export class PlayerHandComponent {
  @Input() player!: Player;
  @Input() cardWidth = 90;
  @Input() cardHeight = 126;

  getMeansCardImage = getMeansCardImage;
  getMeansCardBack = getMeansCardBack;
  getClueCardImage = getClueCardImage;
  getClueCardBack = getClueCardBack;

  isFlipped(cardId: string): boolean {
    return this.player.hand.flippedClues?.includes(cardId) || false;
  }
}
