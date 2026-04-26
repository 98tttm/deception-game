import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player, Role } from '../../../../core/models/game.model';
import { getRoleLabel, getRoleColor } from '../../utils/card-images';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-1">
      <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Người chơi ({{ players.length }})
      </h3>
      @for (p of players; track p.id) {
        <div class="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
             [class]="(p.id === currentPlayerId ? 'bg-gray-700' : '') + (!p.isConnected ? ' opacity-40' : '')">
          <!-- Avatar circle -->
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
               [class]="getAvatarClass(p)">
            {{ p.name.charAt(0).toUpperCase() }}
          </div>
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1">
              <span class="text-sm font-medium truncate"
                    [class.text-white]="p.isConnected"
                    [class.text-gray-500]="!p.isConnected">
                {{ p.name }}
              </span>
              @if (p.id === currentPlayerId) {
                <span class="text-[10px] text-gray-500">(bạn)</span>
              }
            </div>
            @if (p.role && shouldShowRole(p)) {
              <span class="text-[10px] font-semibold" [class]="getRoleColor(p.role)">
                {{ getRoleLabel(p.role) }}
              </span>
            }
          </div>
          <!-- Badges -->
          <div class="flex items-center gap-0.5 shrink-0">
            @for (b of getBadges(p); track $index) {
              <div class="w-3 h-3 rounded-full"
                   [class]="b === 'used' ? 'bg-gray-600' : b === 'extra' ? 'bg-yellow-500' : 'bg-red-500'">
              </div>
            }
          </div>
          <!-- Connection -->
          @if (!p.isConnected) {
            <div class="w-2 h-2 rounded-full bg-gray-500 shrink-0" title="Mất kết nối"></div>
          }
        </div>
      }
    </div>
  `,
})
export class PlayerListComponent {
  @Input() players: Player[] = [];
  @Input() currentPlayerId = '';
  @Input() showRoles = false;

  getRoleLabel = getRoleLabel;
  getRoleColor = getRoleColor;

  shouldShowRole(p: Player): boolean {
    return this.showRoles || p.id === this.currentPlayerId;
  }

  getAvatarClass(p: Player): string {
    if (!p.role || !this.shouldShowRole(p)) return 'bg-gray-600 text-gray-300';
    switch (p.role) {
      case 'FORENSIC': return 'bg-blue-600 text-blue-100';
      case 'MURDERER': return 'bg-red-700 text-red-100';
      case 'ACCOMPLICE': return 'bg-red-600 text-red-100';
      case 'WITNESS': return 'bg-yellow-600 text-yellow-100';
      case 'INVESTIGATOR': return 'bg-gray-600 text-gray-300';
    }
  }

  getBadges(p: Player): string[] {
    const badges: string[] = [];
    const totalUsed = 1 - p.badges; // started with 1
    for (let i = 0; i < totalUsed; i++) badges.push('used');
    for (let i = 0; i < p.badges; i++) badges.push('normal');
    for (let i = 0; i < p.extraBadges; i++) badges.push('extra');
    return badges;
  }
}
