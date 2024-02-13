import { CommonModule } from "@angular/common";
import { provideHttpClient } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  type Type,
} from "@angular/core";
import {
  render as atlRender,
  type RenderComponentOptions,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/angular";
import { type Mock as VitestFunctionMock, vi } from "vitest";
import { routes } from "../src/app/app.routes";
import { type Theme } from "../src/app/common/theme.service";
import { provideTheme } from "../src/app/common/theme.service.provider";
import type { User } from "../src/app/common/user";
import { buildUser } from "./generate";
import type { UserWithoutPassword } from "./mocks/fake-backend";

export function waitForLoadingToFinish() {
  return waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ]);
}

export async function loginAsUser(userProperties?: User) {
  const user = buildUser.one({
    overrides: userProperties,
    traits: "generatedInTest",
  });

  const { id, ...rest } = user;

  await fetch(`https://api.example.com/user/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rest),
  });

  const authUserResponse = await fetch("https://api.example.com/login", {
    method: "POST",
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: user.username,
      password: user.password,
    }),
  });

  return (await authUserResponse.json()) as UserWithoutPassword;
}

async function render<ComponentType>(
  ui: Type<ComponentType>,
  {
    theme = "light",
    // `/list` is the main route in our example app
    route = "/list",
    user,
    ...options
  }: RenderComponentOptions<ComponentType> & {
    theme?: Theme;
    route?: string;
    // Pass `null` to render the app without authenticating.
    user?: null | UserWithoutPassword;
  } = {},
) {
  const loggedInUser = user === undefined ? await loginAsUser() : user;

  const result = await atlRender(ui, {
    providers: [
      provideHttpClient(),
      provideTheme(theme),
      ...(options.providers ?? []),
    ],
    routes,
    ...options,
  });

  await result.navigate(route);

  const returnValue = {
    ...result,
    user: loggedInUser,
  };

  await waitForLoadingToFinish();

  return returnValue;
}

/*
 * Adapted from
 * @testing-library/angular/jest-utils/lib/create-mock.d.ts
 * @testing-library/angular/fesm2022/testing-library-angular-jest-utils.mjs
 */
export type CreatedMock<T> = T & {
  [K in keyof T]: T[K] & VitestFunctionMock;
};

export function createMock<T>(type: Type<T>) {
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

/*
 * Basic implementation inspired by React Testing Library's `renderHook`:
 * https://testing-library.com/docs/react-testing-library/api/#renderhook
 * Recommended when publishing services as packages or for complex services.
 * For all other services, prefer testing a component using the service instead.
 */
export async function renderService<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TService extends abstract new (...args: any) => any,
>(
  service: TService,
  initialValues: RenderComponentOptions<unknown>["componentProviders"] = [],
) {
  type ServiceInstance = InstanceType<TService>;
  type AssignedResult = { current: ServiceInstance };

  const result: { current: null | ServiceInstance } = { current: null };

  @Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: "angular-testing-library-temp-test",
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: ``,
  })
  class TestComponent {
    readonly #service = inject(service);

    constructor() {
      result.current = this.#service;
    }
  }

  const { fixture } = await render(TestComponent, {
    componentProviders: initialValues,
  });

  return { result: result as AssignedResult, unmount: fixture.destroy };
}

export * from "@testing-library/angular";
// override Angular Testing Library's render with our own
export { render };
