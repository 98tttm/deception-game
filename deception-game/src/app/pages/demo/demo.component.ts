import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Game, Player, GameResult } from '../../core/models/game.model';

import { RoleRevealComponent } from '../game/components/role-reveal/role-reveal.component';
import { NightPhaseComponent } from '../game/components/night-phase/night-phase.component';
import { InvestigationBoardComponent } from '../game/components/investigation-board/investigation-board.component';
import { AccusationModalComponent } from '../game/components/accusation-modal/accusation-modal.component';
import { WitnessHuntComponent } from '../game/components/witness-hunt/witness-hunt.component';
import { GameEndComponent } from '../game/components/game-end/game-end.component';

import {
  createMockGame,
  DEMO_STATES,
  getMockPlayerId,
  getMockForensicView,
  getMockWitnessView,
  getMockEvilView,
  getMockGameResult,
} from '../game/utils/mock-data';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [
    CommonModule,
    RoleRevealComponent,
    NightPhaseComponent,
    InvestigationBoardComponent,
    AccusationModalComponent,
    WitnessHuntComponent,
    GameEndComponent,
  ],
  template: `
    <!-- Navigation bar -->
    <div class="fixed top-0 left-0 right-0 z-[100] bg-gray-950/95 border-b border-gray-800 px-4 py-2 flex items-center gap-3">
      <button (click)="goHome()" class="text-gray-400 hover:text-white text-sm">← Thoát</button>
      <div class="h-4 w-px bg-gray-700"></div>
      <button (click)="prev()" [disabled]="currentIndex === 0"
              class="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-white text-sm rounded">
        ◀ Trước
      </button>
      <span class="text-gray-300 text-sm font-medium flex-1 text-center">
        {{ currentIndex + 1 }}/{{ states.length }} · {{ states[currentIndex].label }}
        <span class="text-gray-500 text-xs ml-2">({{ states[currentIndex].viewAs }})</span>
      </span>
      <button (click)="next()" [disabled]="currentIndex === states.length - 1"
              class="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-white text-sm rounded">
        Sau ▶
      </button>
    </div>

    <!-- Game view with top padding for nav -->
    <div class="pt-10">
      @if (game && currentPlayer) {
        <!-- ROLE_ASSIGN -->
        @if (game.state === 'ROLE_ASSIGN') {
          <app-role-reveal
            [player]="currentPlayer"
            (confirmed)="next()">
          </app-role-reveal>
        }

        <!-- NIGHT phases -->
        @else if (isNightPhase()) {
          <app-night-phase
            [game]="game"
            [player]="currentPlayer"
            [partnerPlayer]="partnerPlayer"
            [forensicView]="forensicView"
            [witnessView]="witnessView"
            (chooseCards)="next()"
            (witnessAck)="next()"
            (forensicAck)="next()">
          </app-night-phase>
        }

        <!-- INVESTIGATION -->
        @else if (isInvestigationPhase()) {
          <app-investigation-board
            [game]="game"
            [player]="currentPlayer"
            [timerDeadline]="timerDeadline"
            [forensicView]="forensicView"
            (placeMarker)="onPlaceMarker($event)"
            (confirmMarkers)="onLog('Confirm markers')"
            (accuseClick)="showAccusation = true"
            (chatSend)="onLog('Chat: ' + $event.content)">
          </app-investigation-board>

          @if (showAccusation) {
            <app-accusation-modal
              [game]="game"
              [player]="currentPlayer"
              (accuse)="onAccuse($event)"
              (cancel)="showAccusation = false">
            </app-accusation-modal>
          }
        }

        <!-- WITNESS_HUNT -->
        @else if (game.state === 'WITNESS_HUNT') {
          <app-witness-hunt
            [game]="game"
            [player]="currentPlayer"
            (hunt)="onLog('Hunt: ' + $event)">
          </app-witness-hunt>
        }

        <!-- GAME_END -->
        @else if (game.state === 'GAME_END') {
          <app-game-end
            [game]="game"
            [player]="currentPlayer"
            [gameResult]="gameResult"
            (backToLobby)="goHome()">
          </app-game-end>
        }
      }
    </div>
  `,
})
export class DemoComponent {
  states = DEMO_STATES;
  currentIndex = 0;

  game!: Game;
  currentPlayer!: Player;
  forensicView: any = null;
  witnessView: any = null;
  partnerPlayer: Player | null = null;
  gameResult: GameResult | null = null;
  timerDeadline = Date.now() + 180000;
  showAccusation = false;

  constructor(private router: Router) {
    this.loadState();
  }

  loadState(): void {
    const s = this.states[this.currentIndex];
    this.game = createMockGame(s.state, s.viewAs);
    const playerId = getMockPlayerId(s.viewAs);
    this.currentPlayer = this.game.players.find(p => p.id === playerId)!;
    this.showAccusation = false;

    // Set role-specific views
    this.forensicView = s.viewAs === 'FORENSIC' ? getMockForensicView() : null;
    this.witnessView = s.viewAs === 'WITNESS' ? getMockWitnessView() : null;
    this.gameResult = s.state === 'GAME_END' ? getMockGameResult() : null;

    // Partner for evil team
    const evilView = getMockEvilView(s.viewAs);
    if (evilView) {
      this.partnerPlayer = this.game.players.find(p => p.id === evilView.partnerId) || null;
    } else {
      this.partnerPlayer = null;
    }

    this.timerDeadline = Date.now() + 180000;
  }

  next(): void {
    if (this.currentIndex < this.states.length - 1) {
      this.currentIndex++;
      this.loadState();
    }
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.loadState();
    }
  }

  isNightPhase(): boolean {
    return ['NIGHT_EVIL_DISCUSS', 'NIGHT_EVIL_CHOOSE_CARDS', 'NIGHT_WITNESS_REVEAL', 'NIGHT_FORENSIC_REVEAL']
      .includes(this.game.state);
  }

  isInvestigationPhase(): boolean {
    return ['INVESTIGATION_ROUND_1', 'INVESTIGATION_ROUND_2', 'INVESTIGATION_ROUND_3']
      .includes(this.game.state);
  }

  onPlaceMarker(event: { tileId: string; optionIndex: number }): void {
    this.game = { ...this.game, markers: { ...this.game.markers, [event.tileId]: event.optionIndex } };
  }

  onAccuse(event: any): void {
    console.log('Accusation:', event);
    this.showAccusation = false;
  }

  onLog(msg: string): void {
    console.log('[Demo]', msg);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
