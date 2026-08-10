import { Component, output } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  imports: []
})
export class FooterComponent {
  scrollTo = output<string>();
  openContact = output<void>();

  onScrollTo(sectionId: string, event: Event): void {
    event.preventDefault();
    this.scrollTo.emit(sectionId);
  }

  onOpenContact(event: Event): void {
    event.preventDefault();
    this.openContact.emit();
  }
}
