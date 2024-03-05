import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import {
  BASE_COLOR,
  GRAY_COLOR,
  INDIGO_COLOR,
  TEXT_COLOR,
} from "../styles/colors";

export type ButtonVariant = "primary" | "secondary";

export const buttonStyles = `
    :host {
      padding: 10px 15px;
      border: 0;
      line-height: 1;
      border-radius: 3px;
    }

    :host[variant=primary] {
      background: ${INDIGO_COLOR};
      color: ${BASE_COLOR};
    }

    :host[variant=secondary] {
      background: ${GRAY_COLOR};
      color: ${TEXT_COLOR};
    }
  `;

@Component({
  selector: "button[app-button]",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: buttonStyles,
  template: `
    <ng-content />
  `,
})
export class ButtonComponent {
  @Input()
  variant: ButtonVariant = "primary";
}
