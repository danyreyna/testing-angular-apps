import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
} from "@angular/core";
import { ThemeService } from "../common/theme/theme.service";

const styles = {
  dark: {
    "background-color": "rgb(0, 0, 0)",
    color: "rgb(255, 255, 255)",
  },
  light: {
    "background-color": "rgb(255, 255, 255)",
    color: "rgb(0, 0, 0)",
  },
} as const;

@Component({
  selector: "app-some-button",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button [ngStyle]="style()">{{ label }}</button>
  `,
})
export class SomeButtonComponent {
  readonly #themeService = inject(ThemeService);

  @Input({ required: true })
  label!: string;

  protected readonly style = computed(() => styles[this.#themeService.theme()]);
}
