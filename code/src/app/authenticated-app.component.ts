import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ErrorHandler,
  inject,
  type OnDestroy,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import type { Subscription } from "rxjs";
import { AuthService } from "./common/auth/auth.service";
import type { ErrorBoundaryHandler } from "./common/error/error-boundary";
import { fetchResponse } from "./common/fetch-utils";
import { startPerformanceMonitor } from "./common/profiler";
import {
  GRAY_10_COLOR,
  INDIGO_COLOR,
  TEXT_COLOR,
} from "./common/styles/colors";
import { MEDIUM_BREAKPOINT } from "./common/styles/media-queries";

@Component({
  selector: "a[app-nav-link]",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  /*
   * Go and complain to the Angular team.
   * https://github.com/angular/angular/issues/53809
   */
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    routerLinkActive: "active-link",
  },
  styles: `
      :host {
        display: block;
        padding: 8px 15px 8px 10px;
        margin: 5px 0;
        width: 100%;
        height: 100%;
        color: ${TEXT_COLOR};
        border-radius: 2px;
        border-left: 5px solid transparent;
      }

      :host:hover,
      :host:focus {
        color: ${INDIGO_COLOR};
        text-decoration: none;
        background: ${GRAY_10_COLOR};
      }

      .active-link {
        border-left: 5px solid ${INDIGO_COLOR};
        background: ${GRAY_10_COLOR};
      }
    `,
  template: `
    <ng-content />
  `,
})
export class NavLinkComponent {}

@Component({
  selector: "nav[app-nav]",
  standalone: true,
  imports: [CommonModule, RouterLink, NavLinkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      :host {
        position: static;
        top: auto;
        padding: 1em 1.5em;
        border: 1px solid ${GRAY_10_COLOR};
        border-radius: 3px;
      }

      .links-list {
        list-style: none;
        padding: 0;
      }

      @media (min-width: ${MEDIUM_BREAKPOINT}) {
        :host {
          position: sticky;
          top: 4px;
        }
      }
    `,
  template: `
    <ul class="links-list">
      <li>
        <a app-nav-link title="Go to list" routerLink="/list">Reading List</a>
      </li>
      <li>
        <a app-nav-link title="Go to finished" routerLink="/finished">
          Finished Books
        </a>
      </li>
      <li>
        <a app-nav-link title="Go to discover" routerLink="/discover">
          Discover
        </a>
      </li>
    </ul>
  `,
})
export class NavComponent {}

@Component({
  selector: "app-authenticated-app",
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      .user-bar {
        display: flex;
        align-items: center;
        position: absolute;
        top: 10px;
        right: 10px;
      }

      .logout-button {
        margin-left: 10px;
      }

      .app-container {
        margin: 0 auto;
        padding: 4em 2em;
        max-width: 840px;
        width: 100%;
        display: grid;
        grid-gap: 1em;
        grid-template-columns: 1fr;
        grid-template-rows: auto;
      }

      .nav-container {
        position: relative;
      }

      .routes-container {
        width: 100%;
      }

      @media (min-width: ${MEDIUM_BREAKPOINT}) {
        .app-container {
          grid-template-columns: 1fr 3fr;
          grid-template-rows: none;
        }
      }
    `,
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
          class="logout-button"
          (click)="authService.logoutCommand.run()"
        >
          Logout
        </button>
      </div>

      <div class="app-container">
        <div class="nav-container">
          <nav app-nav></nav>
        </div>

        <main class="routes-container"><app-routes /></main>
      </div>
    </app-error-boundary>
  `,
})
export class AuthenticatedAppComponent implements OnDestroy {
  protected readonly errorBoundaryHandler = inject(
    ErrorHandler,
  ) as ErrorBoundaryHandler;
  protected readonly authService = inject(AuthService);

  readonly #performanceMonitorIntervalId: null | number = null;
  readonly #logoutSubscription: null | Subscription = null;

  constructor() {
    this.#performanceMonitorIntervalId = startPerformanceMonitor(
      10_000,
      async (changeDetectionPerfRecord) => {
        const response = await fetchResponse(() =>
          fetch("https://api.example.com/profiler", {
            method: "post",
            credentials: "include",
            body: JSON.stringify(changeDetectionPerfRecord),
          }),
        );

        if (
          response instanceof Error &&
          this.#performanceMonitorIntervalId !== null
        ) {
          clearInterval(this.#performanceMonitorIntervalId);
        }
      },
    );

    this.#logoutSubscription =
      this.authService.logoutCommand.observable$.subscribe();
  }

  ngOnDestroy() {
    if (this.#performanceMonitorIntervalId !== null) {
      clearInterval(this.#performanceMonitorIntervalId);
    }

    this.#logoutSubscription?.unsubscribe();
    this.authService.cleanup();
  }
}
