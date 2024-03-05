import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ErrorHandler,
  inject,
  Injectable,
  signal,
} from "@angular/core";
import { handleError } from "./handle-error";

/*
 * Note that scoped `ErrorHandler`s don't catch errors thrown in constructors or lifecycle hooks.
 * They bubble up to the top-level `ErrorHandler`.
 * In this case, they're caught in the `GlobalErrorHandler` class in `app.config.ts`.
 * Since it's global, we can't bind it to a specific `ErrorBoundaryComponent`.
 *
 * Quoting a feature request thread from 2017, to add a more comprehensive, Angular-native error boundary:
 * > This would be very helpful. The fact that in Angular entire app "sinks" on a single error in some component is just embarrassing 👎
 * https://github.com/angular/angular/issues/18509
 */
@Injectable()
export class ErrorBoundaryHandler implements ErrorHandler {
  readonly error = signal<null | Error>(null);
  readonly hasError = computed(() => this.error() !== null);

  handleError(error: Error) {
    console.log("Hello from ErrorBoundaryHandler", error);
    handleError(error);

    this.error.set(error);
  }
}

@Component({
  selector: "app-error-boundary",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (errorBoundaryHandler.hasError()) {
      <ng-content select="[fallback]" />
    } @else {
      <ng-content />
    }
  `,
})
export class ErrorBoundaryComponent {
  protected readonly errorBoundaryHandler = inject(
    ErrorHandler,
  ) as ErrorBoundaryHandler;
}
