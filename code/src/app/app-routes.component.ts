import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ErrorHandler,
  inject,
  Input,
} from "@angular/core";
import type { ErrorBoundaryHandler } from "./common/error/error-boundary";
import { ErrorMessageComponent } from "./common/error/error-message.component";

@Component({
  selector: "app-error-fallback",
  standalone: true,
  imports: [CommonModule, ErrorMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      .error-fallback-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    `,
  template: `
    <div
      app-error-message
      [errorMessage]="errorMessage"
      class="error-fallback-container"
    ></div>
  `,
})
export class ErrorFallbackComponent {
  @Input({ required: true })
  errorMessage = "";
}

@Component({
  selector: "[app-routes]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-error-boundary>
      <app-error-fallback
        [errorMessage]="errorBoundaryHandler.error()?.message ?? ''"
        fallback
      />

      <router-outlet />
    </app-error-boundary>
    >
  `,
})
export class AppRoutesComponent {
  protected readonly errorBoundaryHandler = inject(
    ErrorHandler,
  ) as ErrorBoundaryHandler;
}
