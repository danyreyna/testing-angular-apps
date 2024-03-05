import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  numberAttribute,
} from "@angular/core";

@Component({
  selector: "app-spinner",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  /*
   * Go and complain to the Angular team.
   * https://github.com/angular/angular/issues/53809
   */
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    "aria-label": "loading",
  },
  styles: `
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      :host {
        display: block;
        animation: spin 1s linear infinite;
        fill: currentColor;
      }
    `,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      [attr.width]="size"
      [attr.height]="size"
    >
      <path
        d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"
      />
    </svg>
  `,
})
export class SpinnerComponent {
  @Input({ transform: numberAttribute })
  size = 16;
}
