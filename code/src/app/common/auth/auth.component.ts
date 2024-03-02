import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import type {
  BootstrapWithState,
  SuccessBootstrap,
} from "../bootstrap.service";
import { FullPageErrorFallbackComponent } from "../components/full-page-error-fallback.component";
import { FullPageSpinnerComponent } from "../components/full-page-spinner.component";
import {
  type ErrorResponse,
  isErrorResponse,
  isPending,
  isSuccessResponse,
  PendingState,
} from "../response-state/state";
import { type TypeGuard, TypeGuardPipe } from "../type-guard.pipe";
import { AuthService } from "./auth.service";

@Component({
  selector: "app-auth",
  standalone: true,
  imports: [
    CommonModule,
    FullPageErrorFallbackComponent,
    FullPageSpinnerComponent,
    TypeGuardPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (authService.bootstrap$ | async; as bootstrap) {
      @if (bootstrap | typeGuard: isPending) {
        <app-full-page-spinner />
      }

      @if (bootstrap | typeGuard: isErrorResponse; as errorResponse) {
        <app-full-page-error-fallback [errorMessage]="errorResponse.message" />
      }

      @if (bootstrap | typeGuard: isSuccessResponse; as successResponse) {
        <ng-content />
      }
    }
  `,
})
export class AuthComponent {
  protected readonly authService = inject(AuthService);

  protected readonly isPending: TypeGuard<BootstrapWithState, PendingState> =
    isPending;

  protected readonly isErrorResponse: TypeGuard<
    BootstrapWithState,
    ErrorResponse
  > = isErrorResponse;

  protected readonly isSuccessResponse: TypeGuard<
    BootstrapWithState,
    SuccessBootstrap
  > = isSuccessResponse;
}
