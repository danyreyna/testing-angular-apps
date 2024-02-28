import { inject, Injectable, signal } from "@angular/core";
import { tap } from "rxjs";
import type { UserFormValues } from "../../unauthenticated-app.component";
import { BootstrapService } from "../bootstrap.service";
import type { CommandWithState } from "../response-state/command-with-state";
import { getHttpCommand } from "../response-state/get-http-command";
import type { SuccessResponse } from "../response-state/response-states";
import type { User, UserWithoutPassword } from "../user";

export type LoginResponseWithState = CommandWithState<UserWithoutPassword>;
export type SuccessLoginResponse = SuccessResponse<UserWithoutPassword>;

export type RegisterResponseWithState = CommandWithState<null>;
export type SuccessRegisterResponse = SuccessResponse<null>;

export type LogoutResponseWithState = CommandWithState<null>;
export type SuccessLogoutResponse = SuccessResponse<null>;

export type RegisterRequestValues = UserFormValues & Pick<User, "source">;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  readonly #bootstrapService = inject(BootstrapService);

  readonly #userState = signal<null | UserWithoutPassword>(null);
  readonly user = this.#userState.asReadonly();

  readonly resetBootstrapDataCache =
    this.#bootstrapService.resetBootstrapDataCache;
  readonly bootstrapResponse$ = this.#bootstrapService.bootstrapRequest$.pipe(
    tap((response) => {
      if (response.state === "success" && response.data !== null) {
        this.#userState.set(response.data.user);
      }
    }),
  );

  readonly #loginCommand = getHttpCommand<UserWithoutPassword, UserFormValues>(
    "https://api.example.com/login",
    {
      method: "post",
      options: {
        withCredentials: true,
      },
    },
  );
  readonly loginSubject = this.#loginCommand.subject;
  readonly loginResponse$ = this.#loginCommand.response.pipe(
    tap((response) => {
      if (response.state === "success") {
        this.#userState.set(response.data);
      }
    }),
  );

  readonly #registerCommand = getHttpCommand<
    null,
    RegisterRequestValues,
    {
      pathParams: { id: string };
    }
  >(
    () => {
      const id = globalThis.crypto.randomUUID();
      return {
        href: `https://api.example.com/register/${id}`,
        pathParams: { id },
      };
    },
    {
      method: "post",
      options: {
        withCredentials: true,
      },
    },
  );
  readonly registerSubject = this.#registerCommand.subject;
  readonly registerResponse$ = this.#registerCommand.response.pipe(
    tap((response) => {
      if (response.state !== "success") {
        return;
      }

      const subjectValue = this.#registerCommand.subject.value;
      if (subjectValue === null) {
        return;
      }

      const { id } = this.#registerCommand.url().pathParams;
      const { username, source } = subjectValue;

      this.#userState.set({
        id,
        username,
        source,
      });
    }),
  );

  readonly #logoutCommand = getHttpCommand<null, null | "logout">(
    "https://api.example.com/logout",
    {
      method: "post",
      shouldSendBodyFromSubject: false,
      options: {
        withCredentials: true,
      },
    },
  );
  readonly logoutSubject = this.#logoutCommand.subject;
  readonly logoutResponse$ = this.#logoutCommand.response.pipe(
    tap((response) => {
      if (response.state === "success") {
        this.#userState.set(null);
      }
    }),
  );
}
