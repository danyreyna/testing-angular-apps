import {
  ChangeDetectionStrategy,
  Component,
  ErrorHandler,
  inject,
  type OnDestroy,
} from "@angular/core";
import type { Subscription } from "rxjs";
import { AuthService } from "./common/auth/auth.service";
import type { ErrorBoundaryHandler } from "./common/error/error-boundary";
import { startPerformanceMonitor } from "./common/profiler";

@Component({
  selector: "app-authenticated-app",
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .user-bar {
        display: flex;
        align-items: center;
        position: absolute;
        top: 10px;
        right: 10px;
      }

      .button {
        margin-left: 10px;
      }
    `,
  ],
  template: `
    <app-error-boundary>
      <app-full-page-error-fallback
        fallback
        [errorMessage]="errorBoundaryHandler.error()?.message ?? ''"
      />

      <div class="user-bar">
        {{ authService.user()?.username }}
        <button
          app-button
          variant="secondary"
          class="button"
          (click)="authService.logoutSubject.next('logout')"
        >
          Logout
        </button>
      </div>
    </app-error-boundary>
  `,
})
export class AuthenticatedAppComponent implements OnDestroy {
  protected readonly errorBoundaryHandler = inject(
    ErrorHandler,
  ) as ErrorBoundaryHandler;
  protected readonly authService = inject(AuthService);

  #performanceMonitorIntervalId: null | number = null;
  #logoutSubscription: null | Subscription = null;

  constructor() {
    this.#performanceMonitorIntervalId = startPerformanceMonitor(
      10_000,
      (changeDetectionPerfRecord) => {
        fetch("https://api.example.com/profiler", {
          method: "post",
          credentials: "include",
          body: JSON.stringify(changeDetectionPerfRecord),
        });
      },
    );

    this.#logoutSubscription = this.authService.logout$.subscribe();
  }

  ngOnDestroy() {
    if (this.#performanceMonitorIntervalId !== null) {
      clearInterval(this.#performanceMonitorIntervalId);
    }

    this.#logoutSubscription?.unsubscribe();
  }
}
