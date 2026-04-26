import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timer-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs text-gray-400">{{ label }}</span>
        <span class="text-sm font-mono font-bold"
              [class]="secondsLeft <= 10 ? 'text-red-500 timer-urgent' : secondsLeft <= 30 ? 'text-yellow-400' : 'text-green-400'">
          {{ formatTime(secondsLeft) }}
        </span>
      </div>
      <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-1000 ease-linear"
             [style.width.%]="percentage"
             [class]="barColorClass">
        </div>
      </div>
    </div>
  `,
})
export class TimerBarComponent implements OnInit, OnDestroy {
  @Input() totalSeconds = 60;
  @Input() deadline = 0; // timestamp in ms
  @Input() label = 'Thời gian';

  secondsLeft = 0;
  percentage = 100;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  get barColorClass(): string {
    if (this.secondsLeft <= 10) return 'bg-red-500';
    if (this.secondsLeft <= 30) return 'bg-yellow-400';
    return 'bg-green-500';
  }

  ngOnInit(): void {
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  tick(): void {
    if (this.deadline > 0) {
      this.secondsLeft = Math.max(0, Math.floor((this.deadline - Date.now()) / 1000));
    }
    this.percentage = this.totalSeconds > 0
      ? Math.max(0, (this.secondsLeft / this.totalSeconds) * 100)
      : 0;
  }

  formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
