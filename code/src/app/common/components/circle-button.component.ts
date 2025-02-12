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

@Component({
  selector: "app-circle-button-content",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="screen-reader-only">
      <ng-content select="[text-label-slot]" />
    </div>
    <span aria-hidden="true">
      <ng-content />
    </span>
  `,
})
export class CircleButtonContentComponent {}

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
  @Input({ transform: numberAttribute })
  size = 40;
}

@Component({
  selector: "button[app-circle-button]",
  standalone: true,
  imports: [CommonModule, CircleButtonContentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: CircleButtonDirective,
      inputs: ["size"],
    },
  ],
  styles: circleButtonStyles,
  template: `
    <app-circle-button-content>
      <ng-container text-label-slot>{{ textLabel }}</ng-container>
      <ng-content />
    </app-circle-button-content>
  `,
})
export class CircleButtonComponent {
  @Input({ required: true })
  textLabel = "";
}
