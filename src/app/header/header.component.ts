import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  imports: []
})
export class HeaderComponent {
  timeStr = input<string>('9:41am');
  dateStr = input<string>('12 March, 2025');

  scrollTo = output<string>();
  openMenu = output<void>();
  openContact = output<void>();

  onLogoClick(event: Event): void {
    event.preventDefault();
    this.scrollTo.emit('home');
  }

  onScrollTo(sectionId: string): void {
    this.scrollTo.emit(sectionId);
  }

  onOpenMenu(): void {
    this.openMenu.emit();
  }

  onOpenContact(): void {
    this.openContact.emit();
  }
}
