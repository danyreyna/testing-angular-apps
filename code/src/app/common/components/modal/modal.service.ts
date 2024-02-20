import { Dialog } from "@angular/cdk/dialog";
import { inject, Injectable, type TemplateRef } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ModalService {
  readonly #dialog = inject(Dialog);

  open<TComponent = unknown>(templateRef: TemplateRef<TComponent>) {
    this.#dialog.open<unknown, unknown, TComponent>(templateRef, {
      panelClass: "modal-overlay",
    });
  }
}
