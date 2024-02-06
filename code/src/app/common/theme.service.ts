import { Inject, Injectable, signal } from "@angular/core";

export type Theme = "light" | "dark";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  readonly theme = signal<Theme>("light");
  constructor(
    @Inject("initialTheme")
    private readonly initialTheme: Theme,
  ) {
    this.theme.set(initialTheme);
  }

  setTheme(newTheme: Theme) {
    this.theme.set(newTheme);
  }
}
