import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { BookSpinnerComponent } from "./book-spinner.component";

@Component({
  selector: "app-full-page-spinner",
  standalone: true,
  imports: [CommonModule, BookSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .full-page-spinner {
      font-size: 4rem;
      height: 100vh;
      display: grid;
      place-items: center;
    }
    `,
  template: `
    <div class="full-page-spinner">
      <app-book-spinner />
    </div>
  `,
})
export class FullPageSpinnerComponent {}
