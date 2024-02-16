import { inject, Injectable, signal } from "@angular/core";
import { catchError, map, of, startWith, tap } from "rxjs";
import { type BootstrapData, BootstrapService } from "../bootstrap.service";
import {
  type HandledObservableError,
  handleObservableError,
} from "../handle-observable-error";
import type { CommandWithState } from "../response-state/command-with-state";
import { getHttpCommand } from "../response-state/get-http-command";
import type { QueryWithState } from "../response-state/query-with-state";
import type {
  ErrorResponse,
  SuccessResponse,
} from "../response-state/response-states";
import type { User, UserWithoutPassword } from "../user";

export type LoginFormValues = Pick<User, "username" | "password">;
export type RegisterFormValues = Pick<User, "username" | "password">;

export type BootstrapResponseWithState = QueryWithState<null | BootstrapData>;
export type SuccessBootstrapResponse = SuccessResponse<null | BootstrapData>;

export type LoginResponseWithState = CommandWithState<UserWithoutPassword>;
export type SuccessLoginResponse = SuccessResponse<UserWithoutPassword>;

export type RegisterResponseWithState = CommandWithState<null>;
export type SuccessRegisterResponse = SuccessResponse<null>;

export type LogoutResponseWithState = CommandWithState<null>;
export type SuccessLogoutResponse = SuccessResponse<null>;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  readonly #bootstrapService = inject(BootstrapService);

  readonly #userState = signal<null | UserWithoutPassword>(null);
  readonly user = this.#userState.asReadonly();

  #bootstrapRequest$ = this.#bootstrapService.bootstrapData$.pipe(
    map<BootstrapData, SuccessBootstrapResponse>((bootstrapData) => ({
      state: "success",
      data: bootstrapData,
    })),
    catchError((errorResponse) => handleObservableError(errorResponse)),
  );

  bootstrapResponse$ = this.#bootstrapRequest$.pipe(
    startWith<BootstrapResponseWithState>({ state: "pending" }),
    tap((response) => {
      if (response.state === "success" && response.data !== null) {
        this.#userState.set(response.data.user);
      }
    }),
    catchError((error: HandledObservableError) => {
      if ("status" in error && error.status === 401) {
        return of<SuccessBootstrapResponse>({
          state: "success",
          data: null,
        });
      }

      return of<ErrorResponse>({
        state: "error",
        message: error.message,
      });
    }),
  );

  readonly #loginCommand = getHttpCommand<UserWithoutPassword, LoginFormValues>(
    "https://api.example.com/login",
    {
      method: "post",
      options: {
        withCredentials: false,
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
    RegisterFormValues,
    {
      pathParams: { id: string };
    }
  >(
    () => {
      const id = globalThis.crypto.randomUUID();
      return { href: `https://api.example.com/user/${id}`, pathParams: { id } };
    },
    {
      method: "put",
      options: {
        withCredentials: false,
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
      const { username } = subjectValue;

      this.#userState.set({
        id,
        username,
        source: "registration",
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
