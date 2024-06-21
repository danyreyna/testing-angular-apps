import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  type OnInit,
} from "@angular/core";
import { MatTooltip } from "@angular/material/tooltip";
import { combineLatest, map, type Observable } from "rxjs";
import type { Book } from "../book/book.service";
import {
  CircleButtonContentComponent,
  CircleButtonDirective,
  circleButtonStyles,
} from "../common/components/circle-button.component";
import { SpinnerComponent } from "../common/components/spinner.component";
import type { HttpCommand } from "../common/response-state/http/command-state";
import { isSuccessResponse } from "../common/response-state/state";
import {
  DANGER_COLOR,
  GRAY_80_COLOR,
  GREEN_COLOR,
  INDIGO_COLOR,
  INDIGO_LIGHTEN_80_COLOR,
  YELLOW_COLOR,
} from "../common/styles/colors";
import { type TypeGuard, TypeGuardPipe } from "../common/type-guard.pipe";
import {
  type CreateListItemCommand,
  type ListItem,
  type ListItemResponseWithState,
  ListItemsService,
  type RemoveListItemCommand,
  type SuccessListItemResponse,
  type UpdateListItemCommand,
} from "../list-item/list-items.service";

@Component({
  selector: "app-times-circle-icon",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      aria-hidden="true"
      data-prefix="far"
      data-icon="times-circle"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      class="svg-inline--fa fa-times-circle fa-w-16 fa-7x"
    >
      <path
        fill="currentColor"
        d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"
        class=""
      ></path>
    </svg>
  `,
})
export class TimesCircleIconComponent {}

@Component({
  selector: "app-book-icon",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path
        d="M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z"
      />
    </svg>
  `,
})
export class BookIconComponent {}

@Component({
  selector: "app-check-circle-icon",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
      />
    </svg>
  `,
})
export class CheckCircleIconComponent {}

@Component({
  selector: "app-minus-circle-icon",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM184 232H328c13.3 0 24 10.7 24 24s-10.7 24-24 24H184c-13.3 0-24-10.7-24-24s10.7-24 24-24z"
      />
    </svg>
  `,
})
export class MinusCircleIconComponent {}

@Component({
  selector: "app-plus-circle-icon",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"
      />
    </svg>
  `,
})
export class PlusCircleIconComponent {}

@Component({
  selector: "button[app-tooltip-button]",
  standalone: true,
  imports: [
    CommonModule,
    TimesCircleIconComponent,
    CircleButtonContentComponent,
    SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: CircleButtonDirective,
      inputs: ["size"],
    },
  ],
  /*
   * Go and complain to the Angular team.
   * https://github.com/angular/angular/issues/53809
   */
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    "[ngClass]": `{
      "error-color": httpCommand.state === "error",
      "loading-color": httpCommand.state === "pending",
      "highlight-color": httpCommand.state === "idle" || httpCommand.state === "success"
    }`,
    "[matTooltip]": `getLabel()`,
    "[disabled]": `httpCommand.state === "pending"`,
  },
  styles: [
    `
      @property --highlight-color {
        syntax: "<color>";
        inherits: false;
        initial-value: ${INDIGO_LIGHTEN_80_COLOR};
      }

      ${circleButtonStyles}

      .error-color:hover,
      .error-color:focus {
        color: ${DANGER_COLOR};
      }

      .loading-color:hover,
      .loading-color:focus {
        color: ${GRAY_80_COLOR};
      }

      .highlight-color:hover,
      .highlight-color:focus {
        color: var(--highlight-color);
      }
    `,
  ],
  template: `
    <app-circle-button-content>
      <ng-container text-label-slot>{{ getLabel() }}</ng-container>

      @if (httpCommand.state === "error") {
        <app-times-circle-icon />
      } @else if (httpCommand.state === "pending") {
        <app-spinner />
      } @else {
        <ng-content />
      }
    </app-circle-button-content>
  `,
})
export class TooltipButtonComponent implements OnInit {
  readonly #elementRef: ElementRef<HTMLButtonElement> = inject(ElementRef);

  @Input({ required: true })
  httpCommand: HttpCommand<null> = { state: "idle" };

  @Input({ required: true })
  textLabel = "";

  protected getLabel() {
    return this.httpCommand.state === "error"
      ? this.httpCommand.error.message
      : this.textLabel;
  }

  @Input({ required: true })
  highlightColor = INDIGO_LIGHTEN_80_COLOR;

  ngOnInit() {
    this.#elementRef.nativeElement.style.setProperty(
      "--highlight-color",
      this.highlightColor,
    );
  }
}

@Component({
  selector: "app-status-buttons",
  standalone: true,
  imports: [
    CommonModule,
    TypeGuardPipe,
    MatTooltip,
    SpinnerComponent,
    TooltipButtonComponent,
    BookIconComponent,
    CheckCircleIconComponent,
    MinusCircleIconComponent,
    PlusCircleIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (viewModel$ | async; as viewModel) {
      @if (
        viewModel.listItem | typeGuard: isSuccessListItemResponse;
        as listItem
      ) {
        @if (listItem.data !== null && listItem.data.finishDate !== null) {
          <button
            app-tooltip-button
            [httpCommand]="viewModel.updateListItemCommand"
            textLabel="Mark as unread"
            (click)="handleMarkAsUnreadClick(listItem.data.id)"
            [highlightColor]="yellowColor"
          >
            <app-book-icon />
          </button>
        }
        @if (listItem.data !== null && listItem.data.finishDate === null) {
          <button
            app-tooltip-button
            [httpCommand]="viewModel.updateListItemCommand"
            textLabel="Mark as read"
            (click)="handleMarkAsReadClick(listItem.data.id)"
            [highlightColor]="greenColor"
          >
            <app-check-circle-icon />
          </button>
        }

        @if (listItem.data !== null) {
          <button
            app-tooltip-button
            [httpCommand]="viewModel.removeListItemCommand"
            textLabel="Remove from list"
            (click)="handleRemoveClick(listItem.data.id)"
            [highlightColor]="dangerColor"
          >
            <app-minus-circle-icon />
          </button>
        } @else {
          <button
            app-tooltip-button
            [httpCommand]="viewModel.createListItemCommand"
            textLabel="Add to list"
            (click)="handleCreateClick()"
            [highlightColor]="indigoColor"
          >
            <app-plus-circle-icon />
          </button>
        }
      }
    }
  `,
})
export class StatusButtonsComponent implements OnInit {
  readonly #listItemsService = inject(ListItemsService);

  @Input({ required: true })
  bookId!: Book["id"];

  readonly #listItem$ = this.#listItemsService.listItem$;

  ngOnInit() {
    this.#listItemsService.getListItemWithBookId(this.bookId);
  }

  protected readonly viewModel$: Observable<{
    listItem: ListItemResponseWithState;
    updateListItemCommand: UpdateListItemCommand;
    removeListItemCommand: RemoveListItemCommand;
    createListItemCommand: CreateListItemCommand;
  }> = combineLatest([
    this.#listItem$,
    this.#listItemsService.updateListItemCommand.observable$,
    this.#listItemsService.removeListItemCommand.observable$,
    this.#listItemsService.createListItemCommand.observable$,
  ]).pipe(
    map(
      ([
        listItem,
        updateListItemCommand,
        removeListItemCommand,
        createListItemCommand,
      ]) => ({
        listItem,
        updateListItemCommand,
        removeListItemCommand,
        createListItemCommand,
      }),
    ),
  );

  protected handleMarkAsUnreadClick(listItemId: ListItem["id"]) {
    this.#listItemsService.updateListItemCommand.run({
      urlParams: {
        pathParams: {
          listItemId,
        },
      },
      body: {
        finishDate: null,
      },
    });
  }

  protected handleMarkAsReadClick(listItemId: ListItem["id"]) {
    this.#listItemsService.updateListItemCommand.run({
      urlParams: {
        pathParams: {
          listItemId,
        },
      },
      body: {
        finishDate: Date.now(),
      },
    });
  }

  protected handleRemoveClick(listItemId: ListItem["id"]) {
    this.#listItemsService.removeListItemCommand.run({
      urlParams: {
        pathParams: {
          listItemId,
        },
      },
    });
  }

  protected handleCreateClick() {
    this.#listItemsService.createListItemCommand.run({
      urlParams: {
        pathParams: {
          listItemId: globalThis.crypto.randomUUID(),
        },
      },
      body: {
        bookId: this.bookId,
      },
    });
  }

  protected readonly isSuccessListItemResponse: TypeGuard<
    ListItemResponseWithState,
    SuccessListItemResponse
  > = isSuccessResponse;

  protected readonly yellowColor = YELLOW_COLOR;
  protected readonly greenColor = GREEN_COLOR;
  protected readonly dangerColor = DANGER_COLOR;
  protected readonly indigoColor = INDIGO_COLOR;
}
