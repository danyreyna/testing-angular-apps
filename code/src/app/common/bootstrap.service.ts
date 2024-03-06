import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { isHandledHttpError } from "../common/error/handle-observable-error";
import {
  getHttpQuery,
  type HttpQuery,
} from "../common/response-state/http/query";
import type { QueryWithState } from "../common/response-state/query";
import type { SuccessResponse } from "../common/response-state/state";
import type { Book } from "./book.service";
import type { ListItem } from "./list-items.service";
import type { UserWithoutPassword } from "./user";

export type BootstrapResponse = {
  user: UserWithoutPassword;
  listItems: (ListItem & { book: null | Book })[];
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
  readonly #bootstrapQuery = getHttpQuery<BootstrapResponse>(
    "https://api.example.com/bootstrap",
    {
      method: "get",
      shouldUseCache: true,
      options: {
        withCredentials: true,
      },
    },
  );

  readonly resetBootstrapCache = this.#bootstrapQuery.resetCache;

  readonly bootstrap$ = this.#bootstrapQuery.observable$.pipe(
    map<HttpQuery<BootstrapResponse>, BootstrapWithState>((httpResult) => {
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
