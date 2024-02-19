import { Directive, ElementRef, inject, Input } from "@angular/core";

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

    this.#element.nativeElement.classList.add("app-button");

    switch (this.variant) {
      case "primary":
        this.#element.nativeElement.classList.add("app-button--primary");
        break;
      case "secondary":
        this.#element.nativeElement.classList.add("app-button--secondary");
        break;
      default: {
        const exhaustiveCheck: never = this.variant;
        return exhaustiveCheck;
      }
    }
  }
}
