import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket!: Socket;
  private connected$ = new BehaviorSubject<boolean>(false);
  private destroy$ = new Subject<void>();

  get isConnected$(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  connect(playerName: string): void {
    if (this.socket?.connected) return;

    this.socket = io(environment.socketUrl, {
      auth: { playerName },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => this.connected$.next(true));
    this.socket.on('disconnect', () => this.connected$.next(false));
  }

  disconnect(): void {
    this.socket?.disconnect();
  }

  emit<T = unknown>(event: string, data?: T): void {
    this.socket?.emit(event, data);
  }

  on<T = unknown>(event: string): Observable<T> {
    return new Observable<T>((observer) => {
      const handler = (data: T) => observer.next(data);
      this.socket?.on(event, handler);
      return () => this.socket?.off(event, handler);
    });
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}
