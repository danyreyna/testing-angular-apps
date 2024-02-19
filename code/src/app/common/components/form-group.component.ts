import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-form-group",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      :host {
        display: flex;
        flex-direction: column;
      }
    `,
  template: `
    <ng-content />
  `,
})
export class FormGroupComponent {}
