import { makeEnvironmentProviders } from "@angular/core";
import { INITIAL_THEME, type Theme, ThemeService } from "./theme.service";

export function provideTheme(initialTheme: Theme) {
  return makeEnvironmentProviders([
    {
      provide: INITIAL_THEME,
      useValue: initialTheme,
    },
    {
      provide: ThemeService,
      deps: [INITIAL_THEME],
    },
  ]);
}
