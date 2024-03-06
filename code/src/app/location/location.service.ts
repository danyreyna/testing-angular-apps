import { inject, Injectable } from "@angular/core";
import { GeolocationService } from "@ng-web-apis/geolocation";
import { catchError, map, of, startWith } from "rxjs";
import {
  type HandledObservableError,
  handleObservableError,
} from "../common/error/handle-observable-error";
import type { QueryWithState } from "../common/response-state/query";
import type {
  ErrorResponse,
  SuccessResponse,
} from "../common/response-state/state";

export type GeolocationResponseWithState = QueryWithState<GeolocationPosition>;
export type SuccessLocationResponse = SuccessResponse<GeolocationPosition>;

@Injectable()
export class LocationService {
  readonly #geolocationService = inject(GeolocationService);

  #locationRequest$ = this.#geolocationService.pipe(
    map<GeolocationPosition, SuccessLocationResponse>((position) => ({
      state: "success",
      data: position,
    })),
    catchError((errorResponse) => handleObservableError(errorResponse)),
  );

  getLocation() {
    return this.#locationRequest$.pipe(
      startWith<GeolocationResponseWithState>({ state: "pending" }),
      catchError((error: HandledObservableError) => {
        return of<ErrorResponse>({
          state: "error",
          message: error.message,
        });
      }),
    );
  }
}
