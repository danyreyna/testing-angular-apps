import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "[app-routes]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />
  `,
})
export class AppRoutesComponent {}
