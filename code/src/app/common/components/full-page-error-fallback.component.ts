import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { DANGER_COLOR } from "../styles/colors";

@Component({
  selector: "app-full-page-error-fallback",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  /*
   * Go and complain to the Angular team.
   * https://github.com/angular/angular/issues/53809
   */
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    role: "alert",
  },
  styles: `
      :host {
        color: ${DANGER_COLOR};
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    `,
  template: `
    <p>Uh oh... There's a problem. Try refreshing the app.</p>
    <pre>{{ errorMessage }}</pre>
  `,
})
export class FullPageErrorFallbackComponent {
  @Input({ required: true })
  errorMessage = "";
}
