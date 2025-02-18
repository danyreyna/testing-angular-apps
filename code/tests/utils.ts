import { CommonModule } from "@angular/common";
import { provideHttpClient } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  type Type,
} from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  render as atlRender,
  type RenderComponentOptions,
  type RenderResult,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { type Mock as VitestFunctionMock, vi } from "vitest";
import { routes } from "../src/app/app.routes";
import { provideAuth } from "../src/app/common/auth/auth.service.provider";
import { type Theme } from "../src/app/common/theme/theme.service";
import { provideTheme } from "../src/app/common/theme/theme.service.provider";
import type { User, UserWithoutPassword } from "../src/app/common/user";
import { buildUser } from "./mocks/user/build-user";

export * from "@testing-library/angular";
export { userEvent };

export async function waitForLoadingToFinish() {
  const loadingElements = [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ];
  if (loadingElements.length === 0) {
    return;
  }

  await waitForElementToBeRemoved(() => loadingElements);
}

export async function loginAsUser(userProperties?: Partial<User>) {
  const user = buildUser.one({
    overrides: userProperties,
    traits: "generatedInTest",
  });

  const { id, ...rest } = user;

  await fetch(`https://api.example.com/register/${id}`, {
    method: "post",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rest),
  });

  const authUserResponse = await fetch("https://api.example.com/login", {
    method: "post",
    credentials: "include",
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

const DEFAULT_THEME = "light";

export function getGlobalProviders({
  theme = DEFAULT_THEME,
}: { theme?: Theme } = {}) {
  return [provideHttpClient(), provideAuth(), provideTheme(theme)];
}

type AdditionalRenderOptions = {
  // Pass `null` to render the app without authenticating.
  user?: null | UserWithoutPassword;
  theme?: Theme;
};

type AdditionalRenderResult = {
  unmount: () => void;
  user: null | UserWithoutPassword;
};

export async function render<ComponentType>(
  ui: Type<ComponentType>,
  {
    user,
    theme = DEFAULT_THEME,
    ...options
  }: RenderComponentOptions<ComponentType> & AdditionalRenderOptions = {},
): Promise<
  RenderResult<ComponentType, ComponentType> & AdditionalRenderResult
> {
  const loggedInUser = user === undefined ? await loginAsUser() : user;

  const renderResult = await atlRender(ui, {
    providers: getGlobalProviders({ theme }),
    routes,
    ...options,
  });
  const returnValue = {
    ...renderResult,
    unmount: () => {
      renderResult.fixture.destroy();
      document.body.removeChild(renderResult.fixture.nativeElement);
      TestBed.resetTestingModule();
    },
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
export type RenderServiceOptions = {
  providers?: RenderComponentOptions<unknown>["providers"];
  componentProviders?: RenderComponentOptions<unknown>["componentProviders"];
  routes?: RenderComponentOptions<unknown>["routes"];
};
export async function internalRenderService<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TService extends abstract new (...args: any) => any,
>(service: TService, renderServiceOptions?: RenderServiceOptions) {
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

  const { fixture, rerender } = await atlRender(
    TestComponent,
    renderServiceOptions,
  );

  return {
    result: result as AssignedResult,
    rerender,
    unmount: () => {
      fixture.destroy();
      document.body.removeChild(fixture.nativeElement);
      TestBed.resetTestingModule();
    },
  };
}

export async function renderService<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TService extends abstract new (...args: any) => any,
>(
  service: TService,
  {
    user,
    theme = DEFAULT_THEME,
    ...options
  }: RenderServiceOptions & AdditionalRenderOptions = {},
) {
  const loggedInUser = user === undefined ? await loginAsUser() : user;

  const returnValue = {
    ...(await internalRenderService(service, {
      providers: getGlobalProviders({ theme }),
      routes,
      ...options,
    })),
    user: loggedInUser,
  };

  await waitForLoadingToFinish();

  return returnValue;
}
