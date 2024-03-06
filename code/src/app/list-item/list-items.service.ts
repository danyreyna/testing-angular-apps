import { Injectable } from "@angular/core";
import { combineLatest, map, Subject } from "rxjs";
import type { Book } from "../book/book.service";
import {
  getHttpQuery,
  type HttpQuery,
} from "../common/response-state/http/query";
import type { QueryWithState } from "../common/response-state/query";
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

@Injectable()
export class ListItemsService {
  readonly #getListItems = getHttpQuery<ListItemsResponseBody>(
    "https://api.example.com/list-items",
    { method: "get", options: { withCredentials: true } },
  );
  readonly listItems$ = this.#getListItems.observable$;

  readonly getListItemWithBookId = new Subject<Book["id"]>();
  readonly #listItemAction$ = this.getListItemWithBookId.asObservable();

  readonly listItem$ = combineLatest([
    this.#listItemAction$,
    this.#getListItems.observable$,
  ]).pipe(
    map<
      [Book["id"], HttpQuery<ListItemsResponseBody>],
      QueryWithState<ListItem | null>
    >(([bookId, httpResult]) => {
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
}
