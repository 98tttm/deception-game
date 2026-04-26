import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { SocketService } from '../../core/services/socket.service';
import { GameStateService } from '../../core/services/game-state.service';
import { Game, Player, GameResult, EventType } from '../../core/models/game.model';

import { RoleRevealComponent } from './components/role-reveal/role-reveal.component';
import { NightPhaseComponent } from './components/night-phase/night-phase.component';
import { InvestigationBoardComponent } from './components/investigation-board/investigation-board.component';
import { AccusationModalComponent } from './components/accusation-modal/accusation-modal.component';
import { EventResolverComponent } from './components/event-resolver/event-resolver.component';
import { WitnessHuntComponent } from './components/witness-hunt/witness-hunt.component';
import { GameEndComponent } from './components/game-end/game-end.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    RoleRevealComponent,
    NightPhaseComponent,
    InvestigationBoardComponent,
    AccusationModalComponent,
    EventResolverComponent,
    WitnessHuntComponent,
    GameEndComponent,
  ],
  template: `
    @if (game && currentPlayer) {
      <!-- ROLE_ASSIGN phase -->
      @if (game.state === 'ROLE_ASSIGN') {
        <app-role-reveal
          [player]="currentPlayer"
          (confirmed)="onRoleConfirmed()">
        </app-role-reveal>
      }

      <!-- NIGHT phases -->
      @else if (isNightPhase()) {
        <app-night-phase
          [game]="game"
          [player]="currentPlayer"
          [partnerPlayer]="getPartnerPlayer()"
          [forensicView]="forensicView"
          [witnessView]="witnessView"
          [partnerSelectedMeans]="partnerSelectedMeans"
          [partnerSelectedClue]="partnerSelectedClue"
          (chooseCards)="onChooseCards($event)"
          (selectingCard)="onSelectingCard($event)"
          (witnessAck)="onWitnessAck()"
          (forensicAck)="onForensicAck()">
        </app-night-phase>
      }

      <!-- INVESTIGATION phases -->
      @else if (isInvestigationPhase()) {
        <app-investigation-board
          [game]="game"
          [player]="currentPlayer"
          [timerDeadline]="timerDeadline"
          [forensicView]="forensicView"
          (placeMarker)="onPlaceMarker($event)"
          (confirmMarkers)="onConfirmMarkers()"
          (accuseClick)="showAccusation = true"
          (chatSend)="onChatSend($event)">
        </app-investigation-board>

        <!-- Accusation modal overlay -->
        @if (showAccusation) {
          <app-accusation-modal
            [game]="game"
            [player]="currentPlayer"
            [result]="accusationResult"
            (accuse)="onAccuse($event)"
            (cancel)="showAccusation = false">
          </app-accusation-modal>
        }

        <!-- Event overlay -->
        @if (game.state === 'EVENT_RESOLVING' || showEvent) {
          <!-- Keep investigation board visible behind -->
        }
      }

      <!-- EVENT_RESOLVING phase (shown as overlay) -->
      @if (game.state === 'EVENT_RESOLVING' && currentEventType) {
        <app-event-resolver
          [game]="game"
          [player]="currentPlayer"
          [eventType]="currentEventType"
          [canAct]="canActOnEvent()"
          (acknowledge)="onEventAcknowledge()"
          (flipClue)="onFlipClue($event)">
        </app-event-resolver>
      }

      <!-- ACCUSATION_RESOLVING (show result overlay on investigation board) -->
      @if (game.state === 'ACCUSATION_RESOLVING') {
        <app-investigation-board
          [game]="game"
          [player]="currentPlayer"
          [timerDeadline]="timerDeadline"
          [forensicView]="forensicView"
          (placeMarker)="onPlaceMarker($event)"
          (confirmMarkers)="onConfirmMarkers()"
          (accuseClick)="showAccusation = true"
          (chatSend)="onChatSend($event)">
        </app-investigation-board>
      }

      <!-- WITNESS_HUNT -->
      @else if (game.state === 'WITNESS_HUNT') {
        <app-witness-hunt
          [game]="game"
          [player]="currentPlayer"
          (hunt)="onWitnessHunt($event)">
        </app-witness-hunt>
      }

      <!-- GAME_END -->
      @else if (game.state === 'GAME_END') {
        <app-game-end
          [game]="game"
          [player]="currentPlayer"
          [gameResult]="gameResult"
          (backToLobby)="onBackToLobby()">
        </app-game-end>
      }
    } @else {
      <div class="flex items-center justify-center min-h-screen bg-gray-900">
        <div class="text-center">
          <div class="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-400 text-xl">Đang tải game...</p>
        </div>
      </div>
    }
  `,
})
export class GameComponent implements OnInit, OnDestroy {
  game: Game | null = null;
  currentPlayer: Player | null = null;
  private destroy$ = new Subject<void>();

  // UI state
  showAccusation = false;
  showEvent = false;
  accusationResult: string | null = null;
  timerDeadline = 0;

  // Role-specific views from server
  forensicView: any = null;
  witnessView: any = null;
  evilView: any = null;
  gameResult: GameResult | null = null;
  currentEventType: EventType | null = null;

  // Real-time partner card selection
  partnerSelectedMeans: string | null = null;
  partnerSelectedClue: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private gameState: GameStateService,
  ) {}

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('roomId');
    if (!roomId) {
      this.router.navigate(['/lobby']);
      return;
    }

    // Timeout: if no game state received in 5s, redirect to lobby
    const loadTimeout = setTimeout(() => {
      if (!this.game) {
        this.router.navigate(['/lobby']);
      }
    }, 5000);

    // Listen to game state updates
    this.socketService
      .on<any>('game:state')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        clearTimeout(loadTimeout);
        this.game = data;
        this.gameState.updateGame(data);

        // Extract role-specific views
        this.forensicView = data.forensicView || null;
        this.witnessView = data.witnessView || null;
        this.evilView = data.evilView || null;
        this.gameResult = data.gameResult || null;

        // Find current player
        const socketId = this.socketService.socketId;
        if (socketId && data.players) {
          this.currentPlayer = data.players.find((p: Player) => p.id === socketId) || null;
        }

        // Handle state-specific logic
        this.handleStateChange(data);
      });

    // Listen to accusation results
    this.socketService
      .on<any>('accusation:result')
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.accusationResult = result.result;
        setTimeout(() => {
          this.accusationResult = null;
          this.showAccusation = false;
        }, 3000);
      });

    // Listen to timer updates
    this.socketService
      .on<any>('timer:update')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.timerDeadline = data.deadline || 0;
      });

    // Listen to partner's real-time card selection during night phase
    this.socketService
      .on<any>('night:partnerSelecting')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.partnerSelectedMeans = data.meansId;
        this.partnerSelectedClue = data.clueId;
      });

    // Listen to event card reveals
    this.socketService
      .on<any>('event:reveal')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.currentEventType = data.type;
      });
  }

  // === State helpers ===

  isNightPhase(): boolean {
    if (!this.game) return false;
    return ['NIGHT_EVIL_DISCUSS', 'NIGHT_EVIL_CHOOSE_CARDS', 'NIGHT_WITNESS_REVEAL', 'NIGHT_FORENSIC_REVEAL']
      .includes(this.game.state);
  }

  isInvestigationPhase(): boolean {
    if (!this.game) return false;
    return ['INVESTIGATION_ROUND_1', 'INVESTIGATION_ROUND_2', 'INVESTIGATION_ROUND_3']
      .includes(this.game.state);
  }

  getPartnerPlayer(): Player | null {
    if (!this.game || !this.evilView?.partnerId) return null;
    return this.game.players.find(p => p.id === this.evilView.partnerId) || null;
  }

  canActOnEvent(): boolean {
    if (!this.currentPlayer || !this.currentEventType) return false;
    switch (this.currentEventType) {
      case 'RULED_OUT_EVIDENCE':
        return this.currentPlayer.role !== 'FORENSIC';
      case 'SECRET_TESTIMONY':
        return this.currentPlayer.role === 'WITNESS';
      case 'ERRONEOUS_INFORMATION':
      case 'A_USEFUL_CLUE':
        return this.currentPlayer.role === 'FORENSIC';
      default:
        return false;
    }
  }

  // === Socket emissions ===

  onRoleConfirmed(): void {
    this.socketService.emit('role:confirmed');
  }

  onSelectingCard(event: { meansId: string | null; clueId: string | null }): void {
    this.socketService.emit('night:selectingCard', event);
  }

  onChooseCards(event: { meansId: string; clueId: string }): void {
    this.socketService.emit('night:chooseCards', event);
  }

  onWitnessAck(): void {
    this.socketService.emit('night:witnessAck');
  }

  onForensicAck(): void {
    this.socketService.emit('night:forensicAck');
  }

  onPlaceMarker(event: { tileId: string; optionIndex: number }): void {
    this.socketService.emit('forensic:placeMarker', event);
  }

  onConfirmMarkers(): void {
    this.socketService.emit('forensic:confirmMarkers');
  }

  onAccuse(event: { targetId: string; meansCardId: string; clueCardId: string }): void {
    this.socketService.emit('accusation:make', event);
  }

  onChatSend(event: { content: string; channel: string }): void {
    this.socketService.emit('chat:send', event);
  }

  onEventAcknowledge(): void {
    this.socketService.emit('event:acknowledge');
    this.currentEventType = null;
  }

  onFlipClue(cardId: string): void {
    this.socketService.emit('event:flipClue', { cardId });
  }

  onWitnessHunt(targetId: string): void {
    this.socketService.emit('witnessHunt:choose', { targetId });
  }

  onBackToLobby(): void {
    this.socketService.emit('room:leave');
    this.gameState.reset();
    this.router.navigate(['/lobby']);
  }

  // === Private ===

  private handleStateChange(data: any): void {
    // Reset partner selections when leaving card choose phase
    if (data.state !== 'NIGHT_EVIL_CHOOSE_CARDS') {
      this.partnerSelectedMeans = null;
      this.partnerSelectedClue = null;
    }

    // Reset accusation modal when leaving accusation state
    if (data.state !== 'ACCUSATION_RESOLVING') {
      this.showAccusation = false;
      this.accusationResult = null;
    }

    // Extract event type from game data if in event resolving
    if (data.state === 'EVENT_RESOLVING' && data.currentEvent) {
      this.currentEventType = data.currentEvent.type;
    }
  }

  getStateLabel(state: string): string {
    const labels: Record<string, string> = {
      LOBBY: 'Sảnh chờ',
      ROLE_ASSIGN: 'Chia vai',
      NIGHT_EVIL_DISCUSS: 'Đêm - Thảo luận',
      NIGHT_EVIL_CHOOSE_CARDS: 'Đêm - Chọn bài',
      NIGHT_WITNESS_REVEAL: 'Đêm - Nhân chứng',
      NIGHT_FORENSIC_REVEAL: 'Đêm - Pháp y',
      INVESTIGATION_ROUND_1: 'Điều tra vòng 1',
      INVESTIGATION_ROUND_2: 'Điều tra vòng 2',
      INVESTIGATION_ROUND_3: 'Điều tra vòng 3',
      EVENT_RESOLVING: 'Xử lý sự kiện',
      ACCUSATION_RESOLVING: 'Buộc tội',
      WITNESS_HUNT: 'Săn nhân chứng',
      GAME_END: 'Kết thúc',
    };
    return labels[state] || state;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
