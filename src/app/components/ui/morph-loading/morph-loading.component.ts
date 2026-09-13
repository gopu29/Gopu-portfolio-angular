import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-morph-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (variant() === 'morph') {
      <div [class]="containerClasses()" aria-label="Loading animation">
        <div class="morph-center">
          @for (i of dots; track i) {
            <div 
              class="morph-dot"
              [class]="'morph-dot-' + i"
              [style.animationDelay]="(i * 0.2) + 's'">
            </div>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './morph-loading.component.scss'
})
export class MorphLoadingComponent {
  variant = input<'morph'>('morph');
  size = input<'sm' | 'md' | 'lg'>('md');
  customClass = input<string>('', { alias: 'class' });

  dots = [0, 1, 2, 3];

  containerClasses = computed(() => {
    const sizeMap = {
      sm: 'morph-sm',
      md: 'morph-md',
      lg: 'morph-lg'
    };
    return `morph-container ${sizeMap[this.size()] || 'morph-md'} ${this.customClass()}`.trim();
  });
}
