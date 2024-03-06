import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "ul[app-book-list]",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      :host {
        list-style: none;
        padding: 0;
        display: grid;
        grid-template-rows: repeat(auto-fill, minmax(100px, 1fr));
        grid-gap: 1em;
      }
    `,
  template: `
    <ng-content />
  `,
})
export class BookListComponent {}
