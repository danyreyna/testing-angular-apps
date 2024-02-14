import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, mergeMap, shareReplay } from "rxjs";
import type { Book } from "./book.service";
import { handleObservableError } from "./handle-observable-error";
import type { ListItem } from "./list-item.service";
import type { UserWithoutPassword } from "./user";

export type BootstrapData = {
  user: UserWithoutPassword;
  listItems: (ListItem & Book)[];
};

@Injectable({
  providedIn: "root",
})
export class BootstrapService {
  readonly #http = inject(HttpClient);

  readonly clearCacheSubject = new BehaviorSubject<null>(null);

  #bootstrapResponse$ = this.clearCacheSubject.pipe(
    mergeMap(() =>
      this.#http.get<BootstrapData>("https://api.example.com/bootstrap"),
    ),
  );

  bootstrapData$ = this.#bootstrapResponse$.pipe(
    shareReplay(1),
    catchError((errorResponse) => handleObservableError(errorResponse)),
  );
}
