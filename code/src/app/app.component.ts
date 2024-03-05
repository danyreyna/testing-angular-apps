import { CommonModule, type NgComponentOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from "@angular/core";
import { AuthComponent } from "./common/auth/auth.component";
import { AuthService } from "./common/auth/auth.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, AuthComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth>
      <ng-container
        *ngComponentOutlet="
          componentOutlet().component;
          ngModule: componentOutlet().module
        "
      ></ng-container>
    </app-auth>
  `,
})
export class AppComponent {
  readonly #authService = inject(AuthService);

  protected componentOutlet = signal<{
    module?: NgComponentOutlet["ngComponentOutletNgModule"];
    component: NgComponentOutlet["ngComponentOutlet"];
  }>({
    component: null,
  });

  constructor() {
    effect(async () => {
      if (this.#authService.user() === null) {
        const esModule = await import("./unauthenticated-app.component");

        this.componentOutlet.set({
          module: undefined,
          component: esModule.UnauthenticatedAppComponent,
        });
      } else {
        const ngModuleEsModule = await import("./authenticated-app.module");
        const componentEsModule = await import("./authenticated-app.component");

        this.componentOutlet.set({
          module: ngModuleEsModule.AuthenticatedAppModule,
          component: componentEsModule.AuthenticatedAppComponent,
        });
      }
    });
  }
}
