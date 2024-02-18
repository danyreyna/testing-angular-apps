import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-form-group",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      .form-group {
        display: flex;
        flex-direction: column;
      }
    `,
  template: `
    <div class="form-group">
      <ng-content />
    </div>
  `,
})
export class FormGroupComponent {}
