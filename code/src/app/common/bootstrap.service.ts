import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, mergeMap, shareReplay } from "rxjs";
import type { Book } from "./book.service";
import { handleObservableError } from "./handle-observable-error";
import type { ListItem } from "./list-item.service";
import type { UserWithoutPassword } from "./user";

export type BootstrapData = {
  user: UserWithoutPassword;
  listItems: (ListItem & { book: null | Book })[];
};

@Injectable({
  providedIn: "root",
})
export class BootstrapService {
  readonly #http = inject(HttpClient);

  readonly resetCacheSubject = new BehaviorSubject<null>(null);

  #bootstrapResponse$ = this.resetCacheSubject.pipe(
    mergeMap(() =>
      this.#http.get<BootstrapData>("https://api.example.com/bootstrap", {
        withCredentials: true,
      }),
    ),
  );

  bootstrapData$ = this.#bootstrapResponse$.pipe(
    map(({ user, listItems }) => {
      const books = listItems.reduce((accumulator, { book }) => {
        if (book === null) {
          return accumulator;
        }

        accumulator.set(book.id, book);
        return accumulator;
      }, new Map<string, Book>());

      return { user, listItems, books };
    }),
    shareReplay(1),
    catchError((errorResponse) => handleObservableError(errorResponse)),
  );
}
