import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import {
  BASE_COLOR,
  GRAY_COLOR,
  INDIGO_COLOR,
  TEXT_COLOR,
} from "../styles/colors";

@Component({
  selector: "app-button",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .button-styles {
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
  ],
  template: `
    <button
      [ngClass]="['button-styles', variant]"
      (click)="handleClick($event)"
    >
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  @Input()
  variant: "primary" | "secondary" = "primary";

  @Output()
  buttonClicked = new EventEmitter<MouseEvent>();

  protected handleClick(event: MouseEvent) {
    this.buttonClicked.emit(event);
  }
}
