import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  numberAttribute,
} from "@angular/core";
import { BASE_COLOR, GRAY_10_COLOR, TEXT_COLOR } from "../styles/colors";

@Component({
  selector: "button[app-circle-button]",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
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
    `,
  /*
   * Go and complain to the Angular team.
   * https://github.com/angular/angular/issues/53809
   */
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    "[style.width.px]": "size",
    "[style.height.px]": "size",
  },
  template: `
    <div class="screen-reader-only">
      {{ textLabel }}
    </div>
    <span aria-hidden="true">
      <ng-content />
    </span>
  `,
})
export class CircleButtonComponent {
  @Input({ required: true })
  textLabel = "";

  @Input({ transform: numberAttribute })
  size = 40;
}
