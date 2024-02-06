import { provideHttpClient } from "@angular/common/http";
import type { Type } from "@angular/core";
import { provideRouter } from "@angular/router";
import {
  render as atlRender,
  type RenderComponentOptions,
} from "@testing-library/angular";
import { type Mock as VitestFunctionMock, vi } from "vitest";
import { routes } from "../src/app/app.routes";
import { type Theme } from "../src/app/common/theme.service";
import { provideTheme } from "../src/app/common/theme.service.provider";

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
      ...provideTheme(theme),
      ...(options.providers ?? []),
    ],
    ...options,
  });
}

/*
 * Adapted from
 * @testing-library/angular/jest-utils/lib/create-mock.d.ts
 * @testing-library/angular/fesm2022/testing-library-angular-jest-utils.mjs
 */
type CreatedMock<T> = T & {
  [K in keyof T]: T[K] & VitestFunctionMock;
};

function createMock<T>(type: Type<T>) {
  const mock: { [property: string]: VitestFunctionMock } = {};

  function mockFunctions(
    currentPrototype: null | { [property: string]: unknown },
  ) {
    if (currentPrototype === null) {
      return;
    }

    for (const property of Object.getOwnPropertyNames(currentPrototype)) {
      if (property === "constructor") {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        currentPrototype,
        property,
      );
      if (typeof descriptor?.value === "function") {
        mock[property] = vi.fn();
      }
    }

    mockFunctions(Object.getPrototypeOf(currentPrototype));
  }

  mockFunctions(type.prototype);

  return mock as CreatedMock<T>;
}

export * from "@testing-library/angular";
// override Angular Testing Library's render with our own
export { render, CreatedMock, createMock };
