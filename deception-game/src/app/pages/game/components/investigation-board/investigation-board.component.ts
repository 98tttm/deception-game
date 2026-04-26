import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SceneTileComponent } from '../scene-tile/scene-tile.component';
import { PlayerHandComponent } from '../player-hand/player-hand.component';
import { PlayerListComponent } from '../player-list/player-list.component';
import { ChatPanelComponent } from '../chat-panel/chat-panel.component';
import { TimerBarComponent } from '../timer-bar/timer-bar.component';
import { Game, Player, SceneTile } from '../../../../core/models/game.model';
import { TIMERS } from '../../../../core/models/constants';

@Component({
  selector: 'app-investigation-board',
  standalone: true,
  imports: [CommonModule, SceneTileComponent, PlayerHandComponent, PlayerListComponent, ChatPanelComponent, TimerBarComponent],
  template: `
    <div class="h-screen flex bg-gray-900">
      <!-- Main content area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top bar: round + timer -->
        <div class="px-4 py-3 border-b border-gray-800 flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-red-500 font-bold text-lg">Vòng {{ game.currentRound }}</span>
            <span class="text-gray-600">·</span>
            <span class="text-gray-400 text-sm">{{ getStateLabel() }}</span>
          </div>
          <div class="flex-1 max-w-xs">
            <app-timer-bar
              [totalSeconds]="getRoundTimer()"
              [deadline]="timerDeadline"
              [label]="isForensic ? 'Đặt dấu' : 'Thảo luận'">
            </app-timer-bar>
          </div>
          @if (!isForensic && player.badges + player.extraBadges > 0) {
            <button (click)="accuseClick.emit()"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold
                           rounded-lg transition-colors flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-white/30"></span>
              Buộc tội
            </button>
          }
          @if (isForensic) {
            <button (click)="confirmMarkers.emit()"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                           rounded-lg transition-colors">
              Xác nhận dấu
            </button>
          }
        </div>

        <!-- Scene board -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="grid grid-cols-3 gap-3 max-w-4xl mx-auto">
            <!-- Location tile -->
            @if (game.sceneBoard.location) {
              <app-scene-tile
                [tile]="game.sceneBoard.location"
                [markerIndex]="getMarker(game.sceneBoard.location.id)"
                [isForensic]="isForensic"
                (placeMarker)="onPlaceMarker($event)">
              </app-scene-tile>
            }
            <!-- Cause tile -->
            @if (game.sceneBoard.cause) {
              <app-scene-tile
                [tile]="game.sceneBoard.cause"
                [markerIndex]="getMarker(game.sceneBoard.cause.id)"
                [isForensic]="isForensic"
                (placeMarker)="onPlaceMarker($event)">
              </app-scene-tile>
            }
            <!-- Clue tiles -->
            @for (tile of game.sceneBoard.clues; track tile.id) {
              <app-scene-tile
                [tile]="tile"
                [markerIndex]="getMarker(tile.id)"
                [isForensic]="isForensic"
                (placeMarker)="onPlaceMarker($event)">
              </app-scene-tile>
            }
          </div>

          @if (isForensic && forensicView) {
            <div class="mt-4 max-w-4xl mx-auto glass rounded-xl p-3">
              <p class="text-xs text-blue-400 mb-1">🔍 Bằng chứng thật (chỉ bạn thấy)</p>
              <p class="text-sm text-gray-300">
                Hung khí: <span class="text-blue-400 font-semibold">{{ getTrueMeansName() }}</span>
                · Manh mối: <span class="text-red-400 font-semibold">{{ getTrueClueName() }}</span>
              </p>
            </div>
          }
        </div>

        <!-- Player's hand at bottom -->
        <div class="border-t border-gray-800 px-4 py-3 bg-gray-900/80">
          <app-player-hand [player]="player" [cardWidth]="75" [cardHeight]="105"></app-player-hand>
        </div>
      </div>

      <!-- Right sidebar: players + chat -->
      <div class="w-72 border-l border-gray-800 flex flex-col bg-gray-900/50 shrink-0">
        <div class="p-3 border-b border-gray-800 overflow-y-auto max-h-60">
          <app-player-list
            [players]="game.players"
            [currentPlayerId]="player.id"
            [showRoles]="false">
          </app-player-list>
        </div>
        <div class="flex-1 min-h-0">
          <app-chat-panel
            [messages]="game.publicChatLog || []"
            [currentPlayerId]="player.id"
            [disabled]="isForensic"
            (sendChat)="chatSend.emit($event)">
          </app-chat-panel>
        </div>
      </div>
    </div>
  `,
})
export class InvestigationBoardComponent {
  @Input() game!: Game;
  @Input() player!: Player;
  @Input() timerDeadline = 0;
  @Input() forensicView: any = null;

  @Output() placeMarker = new EventEmitter<{ tileId: string; optionIndex: number }>();
  @Output() confirmMarkers = new EventEmitter<void>();
  @Output() accuseClick = new EventEmitter<void>();
  @Output() chatSend = new EventEmitter<{ content: string; channel: string }>();

  get isForensic(): boolean {
    return this.player.role === 'FORENSIC';
  }

  getStateLabel(): string {
    if (this.isForensic) return 'Đặt dấu trên bảng hiện trường';
    return 'Thảo luận và phân tích';
  }

  getRoundTimer(): number {
    switch (this.game.currentRound) {
      case 1: return TIMERS.DISCUSSION_ROUND_1;
      case 2: return TIMERS.DISCUSSION_ROUND_2;
      case 3: return TIMERS.DISCUSSION_ROUND_3;
      default: return TIMERS.DISCUSSION_ROUND_1;
    }
  }

  getMarker(tileId: string): number | null {
    const idx = this.game.markers?.[tileId];
    return idx !== undefined ? idx : null;
  }

  onPlaceMarker(event: { tileId: string; optionIndex: number }): void {
    if (this.isForensic) {
      this.placeMarker.emit(event);
    }
  }

  getTrueMeansName(): string {
    if (!this.forensicView?.murdererTrueMeans || !this.forensicView?.murdererHand) return '???';
    const card = this.forensicView.murdererHand.means?.find(
      (c: any) => c.id === this.forensicView.murdererTrueMeans
    );
    return card?.name || this.forensicView.murdererTrueMeans;
  }

  getTrueClueName(): string {
    if (!this.forensicView?.murdererTrueClue || !this.forensicView?.murdererHand) return '???';
    const card = this.forensicView.murdererHand.clues?.find(
      (c: any) => c.id === this.forensicView.murdererTrueClue
    );
    return card?.name || this.forensicView.murdererTrueClue;
  }
}
