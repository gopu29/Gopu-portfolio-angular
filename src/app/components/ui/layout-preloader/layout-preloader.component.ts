import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MorphLoadingComponent } from '../morph-loading/morph-loading.component';

@Component({
  selector: 'app-layout-preloader',
  standalone: true,
  imports: [CommonModule, MorphLoadingComponent],
  templateUrl: './layout-preloader.component.html',
  styleUrl: './layout-preloader.component.scss'
})
export class LayoutPreloaderComponent {
  heroImage = input<string>('after2.jpg');
  heroTitle = input<string>('Govinda P B');
  heroSubtitle = input<string>('Full Stack Developer | Angular & Ionic Specialist');
  progress = input<number>(0);
  phase = input<'loading' | 'preview' | 'revealing' | 'done'>('loading');

  progressString = computed(() => String(this.progress()).padStart(3, '0'));
  columns = [0, 1, 2, 3, 4];
}
