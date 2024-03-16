import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from "@angular/core";
import { ErrorMessageComponent } from "../common/error/error-message.component";
import { isHttpCommandError } from "../common/response-state/http/command-state";
import { GRAY_20_COLOR, ORANGE_COLOR } from "../common/styles/colors";
import { type TypeGuard, TypeGuardPipe } from "../common/type-guard.pipe";
import {
  type ListItem,
  ListItemsService,
  type UpdateListItemCommand,
  type UpdateListItemError,
} from "../list-item/list-items.service";

@Component({
  selector: "app-star",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      :host {
        width: 16px;
        margin: 0 2px;
      }
    `,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 576 512"
      [attr.width]="width"
    >
      <path
        d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
      />
    </svg>
  `,
})
export class StarComponent {
  protected width = 16;
}

@Component({
  selector: "span[app-stars]",
  standalone: true,
  imports: [CommonModule, StarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .color-gray-20 {
        color: ${GRAY_20_COLOR};
      }

      .color-orange {
        color: ${ORANGE_COLOR};
      }

      .star-label {
        cursor: pointer;
        margin: 0;
      }
    `,
  ],
  template: `
    @for (star of stars; track star.ratingId) {
      <ng-container>
        <input
          class="screen-reader-only"
          [name]="inputName"
          type="radio"
          [id]="star.ratingId"
          [value]="star.ratingValue"
          [checked]="star.ratingValue === listItem.rating"
          (change)="handleCheckboxChange(star.ratingValue)"
        />
        <label
          [for]="star.ratingId"
          [ngClass]="{
            'star-label': true,
            'color-gray-20': listItem.rating < 0,
            'color-orange': listItem.rating >= 0
          }"
        >
          <span class="screen-reader-only">
            {{ star.ratingValue }}&nbsp;{{
              star.ratingValue === 1 ? "star" : "stars"
            }}
          </span>
          <app-star />
        </label>
      </ng-container>
    }
  `,
})
export class StarsComponent {
  readonly #listItemsService = inject(ListItemsService);

  @Input({ required: true })
  listItem!: ListItem;

  protected stars = Array.from({ length: 5 }).map((_, index) => ({
    ratingId: `rating-${this.listItem.id}-${index}`,
    ratingValue: index + 1,
  }));

  protected inputName = `list-item-${this.listItem.id}`;

  protected handleCheckboxChange(ratingValue: ListItem["rating"]) {
    this.#listItemsService.updateListItemCommand.run({
      urlParams: {
        pathParams: {
          listItemId: this.listItem.id,
        },
      },
      body: {
        rating: ratingValue,
      },
    });
  }
}

@Component({
  selector: "app-rating",
  standalone: true,
  imports: [CommonModule, StarsComponent, TypeGuardPipe, ErrorMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      :host {
        display: inline-flex;
        align-items: center;
      }

      :host:checked ~ label {
        color: ${GRAY_20_COLOR};
      }

      :host:checked + label {
        color: ${ORANGE_COLOR};
      }

      :host:hover ~ label {
        color: ${GRAY_20_COLOR} !important;
      }

      :host:hover + label {
        color: ${ORANGE_COLOR} !important;
      }

      .stars-container {
        display: flex;
      }
    `,
  template: `
    <span app-stars class="stars-container" [listItem]="listItem"></span>
    @if (
      listItemsService.updateListItemCommand.observable$ | async;
      as updateListItem
    ) {
      @if (updateListItem | typeGuard: isHttpError; as httpError) {
        <app-error-message
          variant="inline"
          [errorMessage]="httpError.error.message"
        />
      }
    }
  `,
})
export class RatingComponent {
  readonly listItemsService = inject(ListItemsService);

  @Input({ required: true })
  listItem!: ListItem;

  protected readonly isHttpError: TypeGuard<
    UpdateListItemCommand,
    UpdateListItemError
  > = isHttpCommandError;
}
