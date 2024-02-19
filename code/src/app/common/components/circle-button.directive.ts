import {
  Directive,
  ElementRef,
  inject,
  Input,
  type OnInit,
} from "@angular/core";

@Directive({
  selector: "[appCircleButton]",
  standalone: true,
})
export class CircleButtonDirective implements OnInit {
  readonly #element = inject<ElementRef<HTMLButtonElement>>(ElementRef);

  @Input({ required: true })
  textLabel = "";

  @Input()
  width = 40;

  @Input()
  height = 40;

  ngOnInit() {
    /*
     * This is ugly, but with an `app-circle-button` component we'd end up with HTML like this:
     * ```html
     * <app-circle-button (buttonClicked)="someClickHandler()">
     *   <button (click)="theInternalClickHandler($event)">
     *     <div class="screen-reader-only">Close</div>
     *     <span aria-hidden="true">×</span>
     *   </button>
     *  </app-circle-button>
     * ```
     * So much for an "enterprise" framework.
     */

    this.#element.nativeElement.classList.add("app-circle-button");
    this.#element.nativeElement.style.width = `${this.width}px`;
    this.#element.nativeElement.style.height = `${this.height}px`;

    const textLabelNode = document.createTextNode(this.textLabel);
    const textLabelDiv = document.createElement("div");
    textLabelDiv.classList.add("screen-reader-only");
    textLabelDiv.appendChild(textLabelNode);

    const originalButtonContent = Array.from(
      this.#element.nativeElement.childNodes,
    );
    this.#element.nativeElement.textContent = "";

    const buttonContentSpan = document.createElement("span");
    buttonContentSpan.setAttribute("aria-hidden", "true");
    buttonContentSpan.append(...originalButtonContent);

    this.#element.nativeElement.appendChild(textLabelDiv);
    this.#element.nativeElement.appendChild(buttonContentSpan);
  }
}
