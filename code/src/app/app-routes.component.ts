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
  template: `
    <app-error-message [errorMessage]="errorMessage" />
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
    <ng-container app-error-boundary>
      <app-error-fallback
        [errorMessage]="errorBoundaryHandler.error()?.message ?? ''"
        fallback
      />

      <router-outlet />
    </ng-container>
  `,
})
export class AppRoutesComponent {
  protected readonly errorBoundaryHandler = inject(
    ErrorHandler,
  ) as ErrorBoundaryHandler;
}
