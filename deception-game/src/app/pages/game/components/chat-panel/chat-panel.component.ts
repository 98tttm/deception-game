import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../../../core/models/game.model';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {{ channel === 'EVIL_PRIVATE' ? 'Phe ác' : 'Thảo luận' }}
        </h3>
        @if (collapsed) {
          <button (click)="collapsed = false" class="text-xs text-gray-500 hover:text-gray-300">Mở</button>
        } @else {
          <button (click)="collapsed = true" class="text-xs text-gray-500 hover:text-gray-300">Thu gọn</button>
        }
      </div>

      @if (!collapsed) {
        <!-- Messages -->
        <div #scrollContainer class="flex-1 overflow-y-auto chat-scroll px-3 py-2 space-y-2 min-h-0">
          @if (messages.length === 0) {
            <p class="text-gray-600 text-xs text-center py-4">Chưa có tin nhắn</p>
          }
          @for (msg of messages; track msg.id) {
            <div class="text-sm">
              <span class="font-semibold" [class]="msg.senderId === currentPlayerId ? 'text-red-400' : 'text-gray-300'">
                {{ msg.senderName }}:
              </span>
              <span class="text-gray-400 ml-1">{{ msg.content }}</span>
              <span class="text-gray-600 text-[10px] ml-1">{{ formatTime(msg.timestamp) }}</span>
            </div>
          }
        </div>

        <!-- Input -->
        @if (!disabled) {
          <div class="px-3 py-2 border-t border-gray-700">
            <div class="flex gap-2">
              <input
                [(ngModel)]="newMessage"
                (keydown.enter)="sendMessage()"
                placeholder="Nhập tin nhắn..."
                class="flex-1 bg-gray-800 rounded-lg px-3 py-1.5 text-sm text-white
                       placeholder-gray-500 border border-gray-700 focus:border-red-500
                       focus:outline-none"
                maxlength="200" />
              <button (click)="sendMessage()"
                      [disabled]="!newMessage.trim()"
                      class="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-700
                             text-white text-sm rounded-lg transition-colors">
                Gửi
              </button>
            </div>
          </div>
        } @else {
          <div class="px-3 py-2 border-t border-gray-700 text-center">
            <span class="text-gray-600 text-xs">🔇 Im lặng (Pháp y)</span>
          </div>
        }
      }
    </div>
  `,
})
export class ChatPanelComponent implements AfterViewChecked {
  @Input() messages: ChatMessage[] = [];
  @Input() currentPlayerId = '';
  @Input() disabled = false;
  @Input() channel: 'PUBLIC' | 'EVIL_PRIVATE' = 'PUBLIC';

  @Output() sendChat = new EventEmitter<{ content: string; channel: string }>();

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;

  newMessage = '';
  collapsed = false;

  sendMessage(): void {
    const content = this.newMessage.trim();
    if (!content) return;
    this.sendChat.emit({ content, channel: this.channel });
    this.newMessage = '';
  }

  formatTime(ts: number): string {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
