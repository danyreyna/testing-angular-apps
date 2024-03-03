import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { DANGER_COLOR } from "../styles/colors";

export type ErrorMessageVariant = "stacked" | "inline";

@Component({
  selector: "app-error-message",
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
      }

      .message {
        white-space: break-spaces;
        margin: 0 0 -5px;
      }

      :host[variant="stacked"],
      .message[variant="stacked"] {
        display: block;
      }

      :host[variant="inline"],
      .message[variant="inline"] {
        display: inline-block;
      }
    `,
  template: `
    <span>There was an error:</span>
    <pre class="message">{{ errorMessage }}</pre>
  `,
})
export class ErrorMessageComponent {
  @Input({ required: true })
  errorMessage = "";

  @Input()
  variant: ErrorMessageVariant = "stacked";
}
