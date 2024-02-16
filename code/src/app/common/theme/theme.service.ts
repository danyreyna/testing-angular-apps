import { Inject, Injectable, InjectionToken, signal } from "@angular/core";

export type Theme = "light" | "dark";
export const INITIAL_THEME = new InjectionToken<Theme>("initialTheme");

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  readonly theme = signal<Theme>("light");
  constructor(
    @Inject(INITIAL_THEME)
    private readonly initialTheme: Theme,
  ) {
    this.theme.set(initialTheme);
  }

  setTheme(newTheme: Theme) {
    this.theme.set(newTheme);
  }
}
