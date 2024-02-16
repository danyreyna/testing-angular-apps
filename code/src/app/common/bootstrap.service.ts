import { Injectable } from "@angular/core";
import { map } from "rxjs";
import type { Book } from "./book.service";
import type { ListItem } from "./list-item.service";
import { getHttpQuery } from "./response-state/get-http-query";
import type { QueryWithState } from "./response-state/query-with-state";
import type { UserWithoutPassword } from "./user";

export type BootstrapResponse = {
  user: UserWithoutPassword;
  listItems: (ListItem & { book: null | Book })[];
};

type NoAuthData = null;
export type BootstrapData = QueryWithState<
  | NoAuthData
  | (BootstrapResponse & {
      books: Map<string, Book>;
    })
>;

@Injectable({
  providedIn: "root",
})
export class BootstrapService {
  readonly #bootstrapQuery = getHttpQuery<BootstrapResponse>(
    "https://api.example.com/bootstrap",
    {
      method: "get",
      options: {
        withCredentials: true,
      },
    },
  );

  resetBootstrapDataCache = this.#bootstrapQuery.resetCacheSubject;

  bootstrapData$ = this.#bootstrapQuery.request.pipe(
    map<QueryWithState<BootstrapResponse>, BootstrapData>((response) => {
      if (response.state === "success") {
        const { user, listItems } = response.data;

        const books = listItems.reduce((accumulator, { book }) => {
          if (book === null) {
            return accumulator;
          }

          accumulator.set(book.id, book);
          return accumulator;
        }, new Map<string, Book>());

        return { state: "success", data: { user, listItems, books } };
      }

      return response;
    }),
  );
}
