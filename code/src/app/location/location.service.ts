import { inject, Injectable } from "@angular/core";
import { GeolocationService } from "@ng-web-apis/geolocation";
import { catchError } from "rxjs";
import { handleObservableError } from "../common/handle-observable-error";

@Injectable({
  providedIn: "root",
})
export class LocationService {
  readonly #geolocationService = inject(GeolocationService);

  location$ = this.#geolocationService.pipe(
    catchError((errorResponse) => handleObservableError(errorResponse)),
  );
}
