import { DialogRef } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from "@angular/core";
import { BASE_COLOR } from "../../styles/colors";
import { MEDIUM_BREAKPOINT } from "../../styles/media-queries";
import { CircleButtonComponent } from "../circle-button.component";

@Component({
  selector: "app-modal",
  standalone: true,
  imports: [CircleButtonComponent, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      background: ${BASE_COLOR};
      max-width: 450px;
      border-radius: 3px;
      padding: 2rem 2rem 3.5rem;
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.2);
      width: 100%;
      margin: 10vh auto;
      outline: none;
    }

    .modal-dismiss-button-container {
      display: flex;
      justify-content: flex-end;
    }

    .modal-title {
      text-align: center;
      font-size: 2em;
    }

    @media (min-width: ${MEDIUM_BREAKPOINT}) {
      :host {
        margin: 20vh auto;
      }
    }
  `,
  /*
   * Go and complain to the Angular team.
   * https://github.com/angular/angular/issues/53809
   */
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    "[attr.aria-label]": "ariaLabel",
  },
  template: `
    <div class="modal-dismiss-button-container">
      <button
        app-circle-button
        (click)="handleCloseClicked()"
        textLabel="Close"
      >
        ×
      </button>
    </div>
    <h3 class="modal-title">{{ title }}</h3>
    <ng-content />
  `,
})
export class ModalComponent {
  readonly #dialogRef = inject(DialogRef);

  @Input({ required: true })
  title = "";

  @Input({ required: true })
  ariaLabel = "";

  protected handleCloseClicked() {
    this.#dialogRef.close();
  }
}
