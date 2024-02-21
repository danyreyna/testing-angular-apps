import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FullPageSpinnerComponent } from "./common/components/full-page-spinner.component";

@Component({
  selector: "app-unauthenticated-app",
  standalone: true,
  imports: [CommonModule, FullPageSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [``],
  template: `
    <div>unauth</div>
  `,
})
export class UnauthenticatedAppComponent {}
