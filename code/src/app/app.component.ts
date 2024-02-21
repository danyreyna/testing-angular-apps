import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  type Type,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AuthComponent } from "./common/auth/auth.component";
import { AuthService } from "./common/auth/auth.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, AuthComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth>
      <ng-container *ngComponentOutlet="componentClass"></ng-container>
    </app-auth>
  `,
})
export class AppComponent {
  readonly #authService = inject(AuthService);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected componentClass: null | Type<any> = null;

  constructor() {
    effect(async () => {
      if (this.#authService.user() === null) {
        const module = await import("./unauthenticated-app.component");
        this.componentClass = module.UnauthenticatedAppComponent;
      } else {
        const module = await import("./authenticated-app.component");
        this.componentClass = module.AuthenticatedAppComponent;
      }
    });
  }
}
