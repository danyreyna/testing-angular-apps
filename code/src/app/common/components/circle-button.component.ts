import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Input,
  numberAttribute,
} from "@angular/core";
import { BASE_COLOR, GRAY_10_COLOR, TEXT_COLOR } from "../styles/colors";

export const circleButtonStyles = `
  :host {
    cursor: pointer;
    border-radius: 30px;
    padding: 0;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${BASE_COLOR};
    color: ${TEXT_COLOR};
    border: 1px solid ${GRAY_10_COLOR};
  }
`;

export function getCircleButtonTemplate(content: string) {
  return `
  <div class="screen-reader-only">
    {{ textLabel }}
  </div>
  <span aria-hidden="true">
    ${content}
  </span>
`;
}

@Directive({
  selector: "[appCircleButton]",
  standalone: true,
  /*
   * Go and complain to the Angular team.
   * https://github.com/angular/angular/issues/53809
   */
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    "[style.width.px]": "size",
    "[style.height.px]": "size",
  },
})
export class CircleButtonDirective {
  @Input({ required: true })
  textLabel = "";

  @Input({ transform: numberAttribute })
  size = 40;
}

@Component({
  selector: "button[app-circle-button]",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: CircleButtonDirective,
      inputs: ["textLabel", "size"],
    },
  ],
  styles: circleButtonStyles,
  template: getCircleButtonTemplate("<ng-content />"),
})
export class CircleButtonComponent {}
