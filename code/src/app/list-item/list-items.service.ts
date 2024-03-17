import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { combineLatest, map, Subject, tap } from "rxjs";
import type { Book } from "../book/book.service";
import {
  getHttpCommand,
  httpDelete,
  httpPut,
} from "../common/response-state/http/command";
import type {
  HttpCommand,
  HttpCommandErrorState,
} from "../common/response-state/http/command-state";
import { getHttpQuery, httpGet } from "../common/response-state/http/query";
import type { QueryWithState } from "../common/response-state/query";
import type { SuccessResponse } from "../common/response-state/state";
import type { User } from "../common/user";

export type ListItem = {
  id: ReturnType<typeof globalThis.crypto.randomUUID>;
  ownerId: User["id"];
  bookId: string;
  rating: number;
  notes: string;
  startDate: number;
  finishDate: null | number;
};

export type ListItemsResponseBody = {
  listItems: (ListItem & { book: null | Book })[];
};

type MappedListItemData = null | ListItem;
export type ListItemResponseWithState = QueryWithState<MappedListItemData>;
export type SuccessListItemResponse = SuccessResponse<MappedListItemData>;

export type UpdateListItemRequestBody = Partial<ListItem>;
type UpdateListItemVariables = {
  urlParams: { pathParams: { listItemId: string } };
  body: UpdateListItemRequestBody;
};
export type UpdateListItemCommand = HttpCommand<null, UpdateListItemVariables>;
export type UpdateListItemError =
  HttpCommandErrorState<UpdateListItemVariables>;

type RemoveListItemVariables = {
  urlParams: { pathParams: { listItemId: string } };
};
export type RemoveListItemCommand = HttpCommand<null, RemoveListItemVariables>;

type CreateListItemVariables = {
  urlParams: { pathParams: { listItemId: string } };
  body: { bookId: Book["id"] };
};
export type CreateListItemCommand = HttpCommand<null, CreateListItemVariables>;

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
  readonly listItemsQuery$ = this.#listItemsQuery.observable$.pipe(
    tap((httpResult) => {
      if (httpResult.state === "success") {
        this.#listItemsState.set(httpResult.response.body);
      }
    }),
    map(({ state }) => state),
  );

  readonly #listItemsState = signal<null | ListItemsResponseBody>(null);
  readonly listItems = this.#listItemsState.asReadonly();

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
      httpPut<null, UpdateListItemRequestBody>(
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

  readonly removeListItemCommand = getHttpCommand({
    commandFn: ({
      urlParams: {
        pathParams: { listItemId },
      },
    }: RemoveListItemVariables) =>
      httpDelete<null>(`https://api.example.com/list-items/${listItemId}`, {
        http: this.#http,
        withCredentials: true,
      }),
    onRequest: ({
      urlParams: {
        pathParams: { listItemId },
      },
    }) => {
      const previousItems = this.listItems();

      this.#listItemsState.update((currentState) => {
        if (currentState === null) {
          return currentState;
        }

        const { listItems } = currentState;

        return {
          listItems: listItems.filter(({ id }) => id !== listItemId),
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

  readonly createListItemCommand = getHttpCommand({
    commandFn: ({
      urlParams: {
        pathParams: { listItemId },
      },
      body,
    }: CreateListItemVariables) =>
      httpPut<null, CreateListItemVariables["body"]>(
        `https://api.example.com/list-items/${listItemId}`,
        {
          http: this.#http,
          withCredentials: true,
          body,
        },
      ),
    onSettled: () => {
      this.#listItemsQuery.invalidateCache();
    },
  });
}
