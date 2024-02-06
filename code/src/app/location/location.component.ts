import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { catchError, map, Observable, of, startWith } from "rxjs";
import type { QueryWithState } from "../common/response-state/query-with-state";
import {
  type ErrorResponse,
  isErrorResponse,
  isPending,
  isSuccessResponse,
  type PendingState,
  type SuccessResponse,
} from "../common/response-state/response-states";
import { type TypeGuard, TypeGuardPipe } from "../common/type-guard.pipe";
import { SpinnerComponent } from "../spinner/spinner.component";
import { LocationService } from "./location.service";

type GeolocationResponseWithState = QueryWithState<GeolocationPosition>;
type SuccessLocationResponse = SuccessResponse<GeolocationPosition>;

@Component({
  selector: "app-location",
  standalone: true,
  imports: [CommonModule, TypeGuardPipe, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .color-red {
      color: red;
    }
  `,
  template: `
    @if (position$ | async; as position) {
      @if (position | typeGuard: isPending) {
        <app-spinner />
      }

      @if (position | typeGuard: isErrorResponse; as errorResponse) {
        <div role="alert" class="color-red">
          {{ errorResponse.message }}
        </div>
      }

      @if (position | typeGuard: isSuccessResponse; as successResponse) {
        <div>
          <p>Latitude: {{ successResponse.data.coords.latitude }}</p>
          <p>Longitude: {{ successResponse.data.coords.longitude }}</p>
        </div>
      }
    }
  `,
})
export class LocationComponent {
  readonly #locationService = inject(LocationService);

  position$: Observable<GeolocationResponseWithState> =
    this.#locationService.location$.pipe(
      map((response) => ({
        state: "success" as const,
        data: response,
      })),
      catchError((error) => {
        return of({
          state: "error" as const,
          message: error.message,
        });
      }),
      startWith({ state: "pending" as const }),
    );

  protected readonly isPending: TypeGuard<
    GeolocationResponseWithState,
    PendingState
  > = isPending;

  protected readonly isErrorResponse: TypeGuard<
    GeolocationResponseWithState,
    ErrorResponse
  > = isErrorResponse;

  protected readonly isSuccessResponse: TypeGuard<
    GeolocationResponseWithState,
    SuccessLocationResponse
  > = isSuccessResponse;
}
