import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: "app-input",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      .input {
        border-radius: 3px;
        border: 1px solid #f1f1f4;
        background: #f1f2f7;
        padding: 8px 12px;
      }
    `,
  template: `
    <input [type]="htmlType" [id]="htmlId" class="input" />
  `,
})
export class InputComponent {
  @Input()
  htmlType = "text";

  @Input({ required: true })
  htmlId = "";
}
