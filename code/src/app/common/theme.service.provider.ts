import { type Theme, ThemeService } from "./theme.service";

function themeServiceFactory(initialTheme: Theme) {
  return new ThemeService(initialTheme);
}

export function provideTheme(initialTheme: Theme) {
  return [
    {
      provide: ThemeService,
      useFactory: themeServiceFactory,
      deps: ["initialTheme"],
    },
    {
      provide: "initialTheme",
      useValue: initialTheme,
    },
  ];
}
