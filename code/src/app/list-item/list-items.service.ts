import { Injectable } from "@angular/core";
import { combineLatest, map, Subject } from "rxjs";
import type { Book } from "../book/book.service";
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

@Injectable()
export class ListItemsService {
  readonly #listItemsQuery = getHttpQuery({
    queryFn: () =>
      httpGet<ListItemsResponseBody>("https://api.example.com/list-items", {
        withCredentials: true,
      }),
  });
  readonly listItems$ = this.#listItemsQuery.observable$;

  readonly getListItemWithBookId = new Subject<Book["id"]>();
  readonly #listItemAction$ = this.getListItemWithBookId.asObservable();

  readonly listItem$ = combineLatest([
    this.#listItemAction$,
    this.#listItemsQuery.observable$,
  ]).pipe(
    map(([bookId, httpResult]): QueryWithState<MappedListItemData> => {
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
