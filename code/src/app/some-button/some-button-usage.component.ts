import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SomeButtonComponent } from "./some-button.component";

@Component({
  selector: "app-some-button-usage",
  standalone: true,
  imports: [CommonModule, SomeButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-some-button label="Hello there" />
  `,
})
export class SomeButtonUsageComponent {}
