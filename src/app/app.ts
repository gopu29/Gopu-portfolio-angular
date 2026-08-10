import { Component, signal, afterNextRender } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Global States
  isMenuOpen = signal(false);
  isContactModalOpen = signal(false);
  isContactModalClosing = signal(false);
  isContactSuccess = signal(false);
  isContactSending = signal(false);

  // Clock States
  timeStr = signal('9:41am');
  dateStr = signal('12 March, 2025');

  // Form inputs
  formName = signal('');
  formEmail = signal('');
  formProject = signal('');

  // Lenis smooth scroll instance
  protected lenis: any = null;
  private clockIntervalId: any = null;

  constructor() {
    afterNextRender(() => {
      // Initialize clock updates
      this.updateClock();
      this.clockIntervalId = setInterval(() => this.updateClock(), 1000);

      // Escape key listeners
      window.addEventListener('keydown', (e) => this.handleKeyPress(e));
    });
  }

  // Scroll helpers
  stopScroll(): void {
    if (this.lenis) this.lenis.stop();
    document.documentElement.style.position = 'relative';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
  }

  startScroll(): void {
    if (this.lenis) this.lenis.start();
    document.documentElement.style.removeProperty('position');
    document.documentElement.style.removeProperty('overflow');
    document.documentElement.style.removeProperty('height');
  }

  scrollToSection(id: string): void {
    const element = document.getElementById(id);
    if (!element) return;
    if (this.lenis) this.lenis.stop();
    setTimeout(() => {
      const top = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: top, behavior: 'smooth' });
      setTimeout(() => {
        if (this.lenis) this.lenis.start();
      }, 100);
    }, 50);
  }

  // Clock Update
  private updateClock(): void {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = String(minutes).padStart(2, '0');
    this.timeStr.set(`${hours}:${minutesStr}${ampm}`);
    
    const days = now.getDate();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthStr = monthNames[now.getMonth()];
    const year = now.getFullYear();
    this.dateStr.set(`${days} ${monthStr}, ${year}`);
  }

  // Navigation Menu Controls
  openNavMenu(): void {
    this.stopScroll();
    this.isMenuOpen.set(true);
  }

  closeNavMenu(): void {
    this.isMenuOpen.set(false);
    this.startScroll();
  }

  // Contact Modal Controls
  openRequestModal(): void {
    this.stopScroll();
    this.isContactModalOpen.set(true);
  }

  closeRequestModal(): void {
    this.isContactModalClosing.set(true);
    this.isContactModalOpen.set(false);

    setTimeout(() => {
      this.isContactModalClosing.set(false);
      this.startScroll();
      
      // Reset contact form state after close transition completes
      setTimeout(() => {
        this.resetContactForm();
      }, 300);
    }, 400);
  }

  private handleKeyPress(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (this.isMenuOpen()) this.closeNavMenu();
      if (this.isContactModalOpen()) this.closeRequestModal();
    }
  }

  // Form Submission
  handleFormSubmit(e: Event): void {
    e.preventDefault();
    this.isContactSending.set(true);

    setTimeout(() => {
      this.isContactSending.set(false);
      this.isContactSuccess.set(true);
    }, 1000);
  }

  private resetContactForm(): void {
    this.formName.set('');
    this.formEmail.set('');
    this.formProject.set('');
    this.isContactSuccess.set(false);
    this.isContactSending.set(false);
  }
}
