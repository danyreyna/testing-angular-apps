import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { DANGER_COLOR } from "../styles/colors";

@Component({
  selector: "app-full-page-error-fallback",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      .full-page-error {
        color: ${DANGER_COLOR};
        height: 100vh;
        display: grid;
        place-items: center;
      }
    `,
  template: `
    <div role="alert" class="full-page-error">
      <p>Uh oh... There's a problem. Try refreshing the app.</p>
      <pre>{{ errorMessage }}</pre>
    </div>
  `,
})
export class FullPageErrorFallbackComponent {
  @Input({ required: true })
  errorMessage = "";
}
