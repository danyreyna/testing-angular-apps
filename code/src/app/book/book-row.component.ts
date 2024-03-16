import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  type OnInit,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import Id from "ajv/lib/vocabularies/core/id";
import type { Book } from "../book/book.service";
import { isSuccessResponse } from "../common/response-state/state";
import {
  GRAY_20_COLOR,
  GRAY_80_COLOR,
  INDIGO_COLOR,
  TEXT_COLOR,
} from "../common/styles/colors";
import { MEDIUM_BREAKPOINT } from "../common/styles/media-queries";
import { type TypeGuard, TypeGuardPipe } from "../common/type-guard.pipe";
import {
  type ListItemResponseWithState,
  ListItemsService,
  type SuccessListItemResponse,
} from "../list-item/list-items.service";
import { RatingComponent } from "../rating/rating.component";
import { StatusButtonsComponent } from "../status-buttons/status-buttons.component";

@Component({
  selector: "app-book-row",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgOptimizedImage,
    TypeGuardPipe,
    RatingComponent,
    RatingComponent,
    StatusButtonsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        position: relative;
      }

      .link {
        min-height: 270px;
        flex-grow: 2;
        display: grid;
        grid-template-columns: 140px 1fr;
        grid-gap: 20px;
        border: 1px solid ${GRAY_20_COLOR};
        color: ${TEXT_COLOR};
        padding: 1.25em;
        border-radius: 3px;
      }
      .link:hover,
      .link:focus {
        text-decoration: none;
        box-shadow: 0 5px 15px -5px rgba(0, 0, 0, 0.08);
        color: inherit;
      }

      .cover-image-container {
        width: 100px;
      }
      .cover-image {
        max-height: 100%;
        width: 100%;
      }

      .book-data-container {
        flex: 1;
      }

      .book-data-container-2 {
        display: flex;
        justify-content: space-between;
      }

      .book-title-and-rating {
        flex: 1;
      }

      .book-title {
        font-size: 1.25em;
        margin: 0;
        color: ${INDIGO_COLOR};
      }

      .author-and-publisher-container {
        margin-left: 10px;
      }

      .author {
        margin-top: 0.4em;
        font-style: italic;
        font-size: 0.85em;
      }

      .synopsis {
        white-space: break-spaces;
        display: block;
      }

      .status-buttons-container {
        margin-left: 20px;
        position: absolute;
        right: -20px;
        color: ${GRAY_80_COLOR};
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        height: 100%;
      }

      @media (min-width: ${MEDIUM_BREAKPOINT}) {
        .cover-image-container {
          width: 140px;
        }
      }
    `,
  ],
  template: `
    <a
      title="Go to book"
      [attr.aria-labelledby]="id"
      [routerLink]="['/book', book.id]"
      class="link"
    >
      <div class="cover-image-container">
        <img
          [ngSrc]="book.coverImageUrl"
          [alt]="coverImageAlt"
          class="cover-image"
          fill
        />
      </div>

      <div class="book-data-container">
        <div class="book-data-container-2">
          <div class="book-title-and-rating">
            <h2 [id]="headerId" class="book-title">{{ book.title }}</h2>
            @if (listItemsService.listItem$ | async; as listItemQuery) {
              @if (
                listItemQuery | typeGuard: isSuccessResponse;
                as listItemSuccess
              ) {
                @if (
                  listItemSuccess.data !== null &&
                  listItemSuccess.data.finishDate !== null
                ) {
                  <app-rating [listItem]="listItemSuccess.data" />
                }
              }
            }
          </div>

          <div class="author-and-publisher-container">
            <div class="author">
              {{ book.author }}
            </div>

            <small>{{ book.publisher }}</small>
          </div>
        </div>

        <small class="synopsis">{{ book.synopsis.substring(0, 500) }}...</small>
      </div>
    </a>

    <div class="status-buttons-container">
      <app-status-buttons [bookId]="book.id" />
    </div>
  `,
})
export class BookRowComponent implements OnInit {
  protected readonly listItemsService = inject(ListItemsService);

  @Input({ required: true })
  book!: Book;

  ngOnInit() {
    this.listItemsService.getListItemWithBookId(this.book.id);
  }

  protected headerId = `book-row-book-${this.book.id}`;
  protected coverImageAlt = `${this.book.title} book cover`;

  protected readonly isSuccessResponse: TypeGuard<
    ListItemResponseWithState,
    SuccessListItemResponse
  > = isSuccessResponse;
  protected readonly id = Id;
}
