import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "input[app-input]",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      :host {
        line-height: inherit;
        border-radius: 3px;
        border: 1px solid #f1f1f4;
        background: #f1f2f7;
        padding: 8px 12px;
      }
    `,
  template: ``,
})
export class InputComponent {}
