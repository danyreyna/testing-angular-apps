import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from "@angular/core";
import { BASE_COLOR, GRAY_10_COLOR, TEXT_COLOR } from "../styles/colors";

@Component({
  selector: "app-circle-button",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      .circle-button {
        border-radius: 30px;
        padding: 0;
        width: 40px;
        height: 40px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${BASE_COLOR};
        color: ${TEXT_COLOR};
        border: 1px solid ${GRAY_10_COLOR};
        cursor: pointer;
      }
    `,
  template: `
    <button class="circle-button" (click)="handleClick($event)">
      <ng-content />
    </button>
  `,
})
export class CircleButtonComponent {
  @Output()
  buttonClicked = new EventEmitter<MouseEvent>();

  protected handleClick(event: MouseEvent) {
    this.buttonClicked.emit(event);
  }
}
