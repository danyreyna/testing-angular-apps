import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-spinner",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    /* loading spinner from https://loading.io/css/ */
    .lds-ripple {
      display: inline-block;
      position: relative;
      width: 64px;
      height: 64px;
    }
  `,
  template: `
    <div class="lds-ripple" aria-label="loading...">
      <div />
      <div />
    </div>
  `,
})
export class SpinnerComponent {}
