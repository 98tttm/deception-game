import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SceneTile } from '../../../../core/models/game.model';
import { getTileCategoryColor, getTileCategoryLabel } from '../../utils/card-images';

@Component({
  selector: 'app-scene-tile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border p-3 transition-all"
         [class]="getTileCategoryColor(tile.category)">
      <!-- Header -->
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-semibold uppercase tracking-wider opacity-70">
          {{ getTileCategoryLabel(tile.category) }}
        </span>
        <span class="text-xs font-medium text-white/80">{{ tile.title }}</span>
      </div>
      <!-- Options -->
      <div class="space-y-1">
        @for (option of tile.options; track $index) {
          <div class="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-sm"
               [class]="markerIndex === $index ? 'bg-white/10' : (isForensic ? 'hover:bg-white/5' : '')"
               (click)="onOptionClick($index)">
            <!-- Marker -->
            <div class="w-4 flex justify-center shrink-0">
              @if (markerIndex === $index) {
                <div class="marker-dot"></div>
              }
            </div>
            <span [class]="markerIndex === $index ? 'text-white font-semibold' : 'text-gray-300'">
              {{ option }}
            </span>
          </div>
        }
      </div>
    </div>
  `,
})
export class SceneTileComponent {
  @Input() tile!: SceneTile;
  @Input() markerIndex: number | null = null;
  @Input() isForensic = false;

  @Output() placeMarker = new EventEmitter<{ tileId: string; optionIndex: number }>();

  getTileCategoryColor = getTileCategoryColor;
  getTileCategoryLabel = getTileCategoryLabel;

  onOptionClick(index: number): void {
    if (this.isForensic) {
      this.placeMarker.emit({ tileId: this.tile.id, optionIndex: index });
    }
  }
}
