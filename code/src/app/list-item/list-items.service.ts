import { HttpClient } from "@angular/common/http";
import { effect, inject, Injectable, signal } from "@angular/core";
import { combineLatest, map, Subject, tap } from "rxjs";
import type { Book } from "../book/book.service";
import { getHttpCommand, httpPut } from "../common/response-state/http/command";
import type {
  HttpCommand,
  HttpCommandErrorState,
} from "../common/response-state/http/command-state";
import { getHttpQuery, httpGet } from "../common/response-state/http/query";
import type { QueryWithState } from "../common/response-state/query";
import type { SuccessResponse } from "../common/response-state/state";
import type { User } from "../common/user";

export type ListItem = {
  id: string;
  ownerId: User["id"];
  bookId: string;
  rating: number;
  notes: string;
  startDate: number;
  finishDate: null | number;
  book: Book;
};

export type ListItemsResponseBody = { listItems: ListItem[] };

type MappedListItemData = null | ListItem;
export type ListItemResponseWithState = QueryWithState<MappedListItemData>;
export type SuccessListItemResponse = SuccessResponse<MappedListItemData>;

type UpdateListItemVariables = {
  urlParams: { pathParams: { listItemId: string } };
  body: Partial<ListItem>;
};
export type UpdateListItemCommand = HttpCommand<null, UpdateListItemVariables>;
export type UpdateListItemError =
  HttpCommandErrorState<UpdateListItemVariables>;

@Injectable()
export class ListItemsService {
  readonly #http = inject(HttpClient);

  readonly #listItemsQuery = getHttpQuery({
    queryFn: () =>
      httpGet<ListItemsResponseBody>("https://api.example.com/list-items", {
        withCredentials: true,
      }),
    shouldUseCache: true,
  });

  readonly #listItemsState = signal<null | ListItemsResponseBody>(null);
  readonly listItems = this.#listItemsState.asReadonly();

  constructor() {
    effect(() => {
      this.#listItemsQuery.observable$.pipe(
        tap((httpResult) => {
          if (httpResult.state === "success") {
            this.#listItemsState.set(httpResult.response.body);
          }
        }),
      );
    });
  }

  readonly #getListItemWithBookIdSubject = new Subject<Book["id"]>();
  readonly #getListItemWithBookIdAction$ =
    this.#getListItemWithBookIdSubject.asObservable();
  getListItemWithBookId(bookId: Book["id"]) {
    this.#getListItemWithBookIdSubject.next(bookId);
  }
  readonly listItem$ = combineLatest([
    this.#getListItemWithBookIdAction$,
    this.#listItemsQuery.observable$,
  ]).pipe(
    map(([bookId, httpResult]): ListItemResponseWithState => {
      if (httpResult.state === "pending") {
        return { state: "pending" };
      }

      if (httpResult.state === "error") {
        return {
          state: "error",
          message: httpResult.error.message,
        };
      }

      const { listItems } = httpResult.response.body;

      const listItem =
        listItems.find(
          ({ bookId: currentBookId }) => currentBookId === bookId,
        ) ?? null;

      return {
        state: "success",
        data: listItem,
      };
    }),
  );

  readonly updateListItemCommand = getHttpCommand({
    commandFn: ({
      urlParams: {
        pathParams: { listItemId },
      },
      body,
    }: UpdateListItemVariables) =>
      httpPut<null, UpdateListItemVariables["body"]>(
        `https://api.example.com/list-items/${listItemId}`,
        {
          http: this.#http,
          withCredentials: true,
          body,
        },
      ),
    onRequest: ({
      urlParams: {
        pathParams: { listItemId: newItemId },
      },
      body: newItemBody,
    }) => {
      const previousItems = this.listItems();

      this.#listItemsState.update((currentState) => {
        if (currentState === null) {
          return currentState;
        }

        const { listItems } = currentState;

        return {
          listItems: listItems.map((item) =>
            item.id === newItemId ? { ...item, ...newItemBody } : item,
          ),
        };
      });

      return () => {
        this.#listItemsState.set(previousItems);
      };
    },
    onError: (_httpResult, recoverFn) => {
      recoverFn();
    },
    onSettled: () => {
      this.#listItemsQuery.invalidateCache();
    },
  });
}
