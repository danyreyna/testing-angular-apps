import { inject, Injectable, InjectionToken, signal } from "@angular/core";

export type Theme = "light" | "dark";
export const INITIAL_THEME = new InjectionToken<Theme>("initialTheme");

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  readonly #initialTheme: Theme = inject(INITIAL_THEME);
  readonly theme = signal<Theme>(this.#initialTheme);

  setTheme(newTheme: Theme) {
    this.theme.set(newTheme);
  }
}
