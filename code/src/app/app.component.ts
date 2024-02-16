import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  type OnInit,
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
  styles: `
      :host {
        font-family: system-ui;
      }
    `,
  template: `
    <app-auth>
      <ng-container *ngComponentOutlet="componentClass"></ng-container>
    </app-auth>
  `,
})
export class AppComponent implements OnInit {
  readonly #authService = inject(AuthService);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected componentClass: null | Type<any> = null;

  async ngOnInit() {
    if (this.#authService.user() === null) {
      const module = await import("./unauthenticated-app.component");
      this.componentClass = module.UnauthenticatedAppComponent;
    } else {
      const module = await import("./authenticated-app.component");
      this.componentClass = module.AuthenticatedAppComponent;
    }
  }
}
