import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { tap } from "rxjs";
import type { UserFormValues } from "../../unauthenticated-app.component";
import { BootstrapService } from "../bootstrap.service";
import { getHttpCommand, httpPost } from "../response-state/http/command";
import type { HttpCommand } from "../response-state/http/command-state";
import type { User, UserWithoutPassword } from "../user";

export type LoginVariables = { body: UserFormValues };
export type LoginResponseWithState = HttpCommand<
  UserWithoutPassword,
  LoginVariables
>;

export type RegisterVariables = {
  urlParams: {
    pathParams: { userId: ReturnType<typeof globalThis.crypto.randomUUID> };
  };
  body: RegisterRequestValues;
};
export type RegisterResponseWithState = HttpCommand<
  UserWithoutPassword,
  RegisterVariables
>;
export type RegisterRequestValues = UserFormValues & Pick<User, "source">;

const API_URL = "https://api.example.com";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  readonly #http = inject(HttpClient);
  readonly #bootstrapService = inject(BootstrapService);

  readonly #userState = signal<null | UserWithoutPassword>(null);
  readonly user = this.#userState.asReadonly();

  readonly invalidateBootstrapCache =
    this.#bootstrapService.invalidateBootstrapCache;
  readonly bootstrap$ = this.#bootstrapService.bootstrap$.pipe(
    tap((bootstrapWithState) => {
      if (
        bootstrapWithState.state === "success" &&
        bootstrapWithState.data !== null
      ) {
        this.#userState.set(bootstrapWithState.data.user);
      }
    }),
  );

  readonly loginCommand = getHttpCommand({
    commandFn: ({ body }: LoginVariables) =>
      httpPost<UserWithoutPassword, UserFormValues>(`${API_URL}/login`, {
        http: this.#http,
        withCredentials: true,
        body,
      }),
    onSuccess: (httpResult) => {
      this.#userState.set(httpResult.response.body);
    },
  });

  readonly registerCommand = getHttpCommand({
    commandFn: ({
      urlParams: {
        pathParams: { userId },
      },
      body,
    }: RegisterVariables) =>
      httpPost<UserWithoutPassword, RegisterRequestValues>(
        `${API_URL}/register/${userId}`,
        {
          http: this.#http,
          withCredentials: true,
          body,
        },
      ),
    onSuccess: (httpResult) => {
      const {
        urlParams: {
          pathParams: { userId },
        },
        body,
      } = httpResult.variables;
      const { username, source } = body;

      this.#userState.set({
        id: userId,
        username,
        source,
      });
    },
  });

  readonly logoutCommand = getHttpCommand({
    commandFn: () =>
      httpPost<null>(`${API_URL}/logout`, {
        http: this.#http,
        withCredentials: true,
      }),
    onSuccess: () => {
      this.#userState.set(null);
    },
  });

  cleanup() {
    this.loginCommand.reset();
    this.registerCommand.reset();
    this.logoutCommand.reset();
  }
}
