import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Game, GameState, Player, LobbyRoom } from '../models/game.model';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private currentGame$ = new BehaviorSubject<Game | null>(null);
  private currentPlayer$ = new BehaviorSubject<Player | null>(null);
  private lobbyRooms$ = new BehaviorSubject<LobbyRoom[]>([]);

  get game$(): Observable<Game | null> {
    return this.currentGame$.asObservable();
  }

  get player$(): Observable<Player | null> {
    return this.currentPlayer$.asObservable();
  }

  get rooms$(): Observable<LobbyRoom[]> {
    return this.lobbyRooms$.asObservable();
  }

  get game(): Game | null {
    return this.currentGame$.value;
  }

  get player(): Player | null {
    return this.currentPlayer$.value;
  }

  updateGame(game: Game): void {
    this.currentGame$.next(game);
  }

  updateGameState(state: GameState): void {
    const game = this.currentGame$.value;
    if (game) {
      this.currentGame$.next({ ...game, state });
    }
  }

  updatePlayer(player: Player): void {
    this.currentPlayer$.next(player);
  }

  updateRooms(rooms: LobbyRoom[]): void {
    this.lobbyRooms$.next(rooms);
  }

  reset(): void {
    this.currentGame$.next(null);
    this.currentPlayer$.next(null);
  }
}
