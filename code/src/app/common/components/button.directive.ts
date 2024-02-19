import { Directive, ElementRef, inject, Input } from "@angular/core";
import {
  BASE_COLOR,
  GRAY_COLOR,
  INDIGO_COLOR,
  TEXT_COLOR,
} from "../styles/colors";

export type ButtonVariant = "primary" | "secondary";

@Directive({
  selector: "[appButton]",
  standalone: true,
})
export class ButtonDirective {
  readonly #element = inject<ElementRef<HTMLButtonElement>>(ElementRef);

  @Input()
  variant: ButtonVariant = "primary";

  constructor() {
    /*
     * This is ugly, but with an `app-button` component we'd end up with HTML rendered like:
     * ```html
     * <app-button variant="primary" (buttonClicked)="someHandler()">
     *   <button (click)="theInternalClickHandler($event)">Click me</button>
     * </app-button>
     * ```
     * That's uglier.
     */

    this.#element.nativeElement.style.cursor = "pointer";
    this.#element.nativeElement.style.padding = "10px 15px";
    this.#element.nativeElement.style.border = "0";
    this.#element.nativeElement.style.lineHeight = "1";
    this.#element.nativeElement.style.borderRadius = "3px";

    switch (this.variant) {
      case "primary":
        this.#element.nativeElement.style.background = INDIGO_COLOR;
        this.#element.nativeElement.style.color = BASE_COLOR;
        break;
      case "secondary":
        this.#element.nativeElement.style.background = GRAY_COLOR;
        this.#element.nativeElement.style.color = TEXT_COLOR;
        break;
      default: {
        const exhaustiveCheck: never = this.variant;
        return exhaustiveCheck;
      }
    }
  }
}
