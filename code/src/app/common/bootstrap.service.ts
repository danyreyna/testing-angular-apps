import { Injectable } from "@angular/core";
import { map } from "rxjs";
import type { Book } from "../book/book.service";
import { isHandledHttpError } from "../common/error/handle-observable-error";
import { getHttpQuery, httpGet } from "../common/response-state/http/query";
import type { QueryWithState } from "../common/response-state/query";
import type { SuccessResponse } from "../common/response-state/state";
import type { ListItem } from "../list-item/list-items.service";
import type { UserWithoutPassword } from "./user";

export type BootstrapResponse = {
  user: UserWithoutPassword;
  listItems: (Omit<ListItem, "book"> & { book: null | Book })[];
};

type NoAuthData = null;
type MappedBoostrapResponse = BootstrapResponse & {
  books: Map<string, Book>;
};
type Bootstrap = NoAuthData | MappedBoostrapResponse;
export type BootstrapWithState = QueryWithState<Bootstrap>;
export type SuccessBootstrap = SuccessResponse<Bootstrap>;

@Injectable({
  providedIn: "root",
})
export class BootstrapService {
  readonly #bootstrapQuery = getHttpQuery({
    queryFn: () =>
      httpGet<BootstrapResponse>("https://api.example.com/bootstrap", {
        withCredentials: true,
      }),
    shouldUseCache: true,
  });
  readonly invalidateBootstrapCache = this.#bootstrapQuery.invalidateCache;
  readonly bootstrap$ = this.#bootstrapQuery.observable$.pipe(
    map((httpResult): BootstrapWithState => {
      if (httpResult.state === "pending") {
        return httpResult;
      }

      if (httpResult.state === "error") {
        if (
          isHandledHttpError(httpResult.error) &&
          httpResult.error.httpErrorResponse.status === 401
        ) {
          return {
            state: "success",
            data: null,
          };
        }

        return {
          state: "error",
          message: httpResult.error.message,
        };
      }

      const { user, listItems } = httpResult.response.body;

      const books = listItems.reduce((accumulator, { book }) => {
        if (book === null) {
          return accumulator;
        }

        accumulator.set(book.id, book);
        return accumulator;
      }, new Map<string, Book>());

      return {
        state: "success",
        data: { user, listItems, books },
      };
    }),
  );
}
