import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-gray-900 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-red-500 mb-2">DECEPTION</h1>
        <p class="text-gray-400 text-lg mb-8">Murder in Hong Kong</p>

        <div class="bg-gray-800 rounded-xl p-8 w-96 mx-auto">
          <input
            type="text"
            [(ngModel)]="playerName"
            placeholder="Nhập tên của bạn..."
            maxlength="20"
            class="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600
                   focus:border-red-500 focus:outline-none mb-4 text-center"
          />

          <button
            (click)="enterLobby()"
            [disabled]="!playerName.trim()"
            class="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600
                   disabled:cursor-not-allowed text-white font-semibold rounded-lg
                   transition-colors"
          >
            Vào Sảnh Chờ
          </button>
        </div>

        <button
          (click)="enterDemo()"
          class="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300
                 text-sm rounded-lg transition-colors">
          🎮 Xem Demo UI
        </button>

        <p class="text-gray-600 text-sm mt-4">4 - 12 người chơi</p>
      </div>
    </div>
  `,
})
export class HomeComponent {
  playerName = '';

  constructor(private router: Router) {}

  enterLobby(): void {
    if (this.playerName.trim()) {
      sessionStorage.setItem('playerName', this.playerName.trim());
      this.router.navigate(['/lobby']);
    }
  }

  enterDemo(): void {
    this.router.navigate(['/demo']);
  }
}
