import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import {
  BASE_COLOR,
  GRAY_COLOR,
  INDIGO_COLOR,
  TEXT_COLOR,
} from "../styles/colors";

export type ButtonVariant = "primary" | "secondary";

@Component({
  selector: "button[app-button]",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  /*
   * Go and complain to the Angular team.
   * https://github.com/angular/angular/issues/53809
   */
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    "[ngClass]": "variant",
  },
  styles: `
      :host {
        cursor: pointer;
        padding: 10px 15px;
        border: 0;
        line-height: 1;
        border-radius: 3px;
      }

      .primary {
        background: ${INDIGO_COLOR};
        color: ${BASE_COLOR};
      }

      .secondary {
        background: ${GRAY_COLOR};
        color: ${TEXT_COLOR};
      }
    `,
  template: `
    <ng-content />
  `,
})
export class ButtonComponent {
  @Input()
  variant: ButtonVariant = "primary";
}
