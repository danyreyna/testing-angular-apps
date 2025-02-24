import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  type ErrorResponse,
  isErrorResponse,
  isPending,
  isSuccessResponse,
  type PendingState,
} from "../common/response-state/state";
import { type TypeGuard, TypeGuardPipe } from "../common/type-guard.pipe";
import { SpinnerComponent } from "../spinner/spinner.component";
import {
  type GeolocationResponseWithState,
  LocationService,
  type SuccessLocationResponse,
} from "./location.service";

@Component({
  selector: "app-location",
  standalone: true,
  imports: [CommonModule, SpinnerComponent, TypeGuardPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LocationService],
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

  position$ = this.#locationService.getLocation();

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
