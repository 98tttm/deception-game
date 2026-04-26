import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SocketService } from '../../core/services/socket.service';
import { GameStateService } from '../../core/services/game-state.service';
import { LobbyRoom } from '../../core/models/game.model';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-900 text-white p-6">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-red-500">Sảnh Chờ</h1>
            <p class="text-gray-400">Xin chào, {{ playerName }}</p>
          </div>
          <div class="flex gap-3">
            <button
              (click)="createDemoRoom()"
              class="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
              Chơi thử (Bot)
            </button>
            <button
              (click)="createRoom()"
              class="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
            >
              + Tạo Phòng
            </button>
          </div>
        </div>

        <!-- Room List -->
        @if (rooms.length === 0) {
          <div class="text-center py-16 text-gray-500">
            <p class="text-xl mb-2">Chưa có phòng nào</p>
            <p>Hãy tạo phòng mới để bắt đầu!</p>
          </div>
        } @else {
          <div class="grid gap-4">
            @for (room of rooms; track room.id) {
              <div class="bg-gray-800 rounded-lg p-4 flex items-center justify-between
                          hover:bg-gray-750 transition-colors">
                <div>
                  <h3 class="font-semibold text-lg">{{ room.name }}</h3>
                  <p class="text-gray-400 text-sm">
                    {{ room.players.length }}/{{ room.maxPlayers }} người ·
                    {{ room.mode === 'AI_FORENSIC' ? 'AI Pháp y' : 'Pháp y người' }}
                  </p>
                </div>
                <button
                  (click)="joinRoom(room.id)"
                  [disabled]="room.status === 'IN_GAME' || room.players.length >= room.maxPlayers"
                  class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600
                         disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {{ room.status === 'IN_GAME' ? 'Đang chơi' : 'Tham gia' }}
                </button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class LobbyComponent implements OnInit, OnDestroy {
  playerName = '';
  rooms: LobbyRoom[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private socketService: SocketService,
    private gameState: GameStateService,
  ) {}

  ngOnInit(): void {
    this.playerName = sessionStorage.getItem('playerName') || '';
    if (!this.playerName) {
      this.router.navigate(['/']);
      return;
    }

    this.socketService.connect(this.playerName);

    this.gameState.rooms$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rooms) => (this.rooms = rooms));

    this.socketService
      .on<LobbyRoom[]>('rooms:list')
      .pipe(takeUntil(this.destroy$))
      .subscribe((rooms) => this.gameState.updateRooms(rooms));

    this.socketService
      .on<string>('room:joined')
      .pipe(takeUntil(this.destroy$))
      .subscribe((roomId) => this.router.navigate(['/game', roomId]));
  }

  createDemoRoom(): void {
    this.socketService.emit('room:createDemo');
  }

  createRoom(): void {
    this.socketService.emit('room:create', {
      name: `Phòng của ${this.playerName}`,
      maxPlayers: 12,
      mode: 'HUMAN_FORENSIC',
      isPrivate: false,
    });
  }

  joinRoom(roomId: string): void {
    this.socketService.emit('room:join', { roomId });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
