import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="card-scene card-glow cursor-pointer rounded-lg"
      [class.card-selected]="selected"
      [class.card-partner-selected]="partnerSelected"
      [class.card-disabled]="disabled"
      [style.width.px]="width"
      [style.height.px]="height"
      (click)="onCardClick()">
      <div class="card-inner" [class.flipped]="flipped">
        <!-- Front -->
        <div class="card-face">
          <img [src]="frontImage" [alt]="label" loading="lazy"
               class="rounded-lg" />
        </div>
        <!-- Back -->
        <div class="card-face card-face-back">
          <img [src]="backImage" [alt]="'Card back'" loading="lazy"
               class="rounded-lg" />
        </div>
      </div>
    </div>
  `,
})
export class CardComponent {
  @Input() frontImage = '';
  @Input() backImage = '';
  @Input() flipped = false;
  @Input() selected = false;
  @Input() partnerSelected = false;
  @Input() disabled = false;
  @Input() label = 'Card';
  @Input() width = 120;
  @Input() height = 168;

  @Output() cardClick = new EventEmitter<void>();

  onCardClick(): void {
    if (!this.disabled) {
      this.cardClick.emit();
    }
  }
}
