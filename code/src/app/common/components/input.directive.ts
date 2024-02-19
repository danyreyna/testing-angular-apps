import { Directive, ElementRef, inject, type OnInit } from "@angular/core";

@Directive({
  selector: "[appInput]",
  standalone: true,
})
export class InputDirective implements OnInit {
  readonly #element = inject<ElementRef<HTMLButtonElement>>(ElementRef);

  ngOnInit() {
    this.#element.nativeElement.classList.add("app-input");
  }
}
