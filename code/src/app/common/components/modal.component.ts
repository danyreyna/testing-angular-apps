import { DialogModule, DialogRef } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from "@angular/core";
import { BASE_COLOR } from "../styles/colors";
import { MEDIUM_BREAKPOINT } from "../styles/media-queries";
import { CircleButtonComponent } from "./circle-button.component";

@Component({
  selector: "app-modal",
  standalone: true,
  imports: [CommonModule, CircleButtonComponent, DialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      .modal-container {
        background: ${BASE_COLOR};
        width: 100%;
        margin: 10vh auto;
        border-radius: 3px;
        padding: 2rem;
        padding-bottom: 3.5em;

        @media (min-width: ${MEDIUM_BREAKPOINT}) {
          max-width: 450px;
          margin: 20vh auto;
        }
      }

      .modal-dismiss-button-container {
        display: flex;
        justify-content: flex-end;
      }

      .modal-title {
        text-align: center;
        font-size: 2em;
      }

      .screen-reader-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `,
  template: `
    <article class="modal-container" [attr.aria-label]="ariaLabel">
      <div class="modal-dismiss-button-container">
        <app-circle-button (buttonClicked)="handleCloseClicked()">
          <div class="screen-reader-only">Close</div>
          <span aria-hidden="true">×</span>
        </app-circle-button>
      </div>
      <h3 class="modal-title">{{ title }}</h3>
      <ng-content />
    </article>
  `,
})
export class ModalComponent {
  readonly #dialogRef = inject(DialogRef);

  @Input({ required: true })
  ariaLabel = "";

  @Input({ required: true })
  title = "";

  protected handleCloseClicked() {
    this.#dialogRef.close();
  }
}
