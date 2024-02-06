import { provideHttpClient } from "@angular/common/http";
import type { Type } from "@angular/core";
import { provideRouter } from "@angular/router";
import {
  render as atlRender,
  type RenderComponentOptions,
} from "@testing-library/angular";
import { routes } from "../src/app/app.routes";
import type { Theme } from "../src/app/common/theme.service";

function render<ComponentType>(
  ui: Type<ComponentType>,
  {
    theme = "light",
    ...options
  }: RenderComponentOptions<ComponentType> & { theme?: Theme } = {},
) {
  return atlRender(ui, {
    providers: [
      provideRouter(routes),
      provideHttpClient(),
      {
        provide: "initialTheme",
        useValue: theme,
      },
      ...(options.providers ?? []),
    ],
    ...options,
  });
}

export * from "@testing-library/angular";
// override Angular Testing Library's render with our own
export { render };
