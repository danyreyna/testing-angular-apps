import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from "rxjs";
import { type BootstrapData, BootstrapService } from "../bootstrap.service";
import {
  type HandledObservableError,
  handleObservableError,
} from "../handle-observable-error";
import type { CommandWithState } from "../response-state/command-with-state";
import type { QueryWithState } from "../response-state/query-with-state";
import type {
  ErrorResponse,
  IdleState,
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

const INITIAL_IDLE_STATE = of<IdleState>({ state: "idle" });

@Injectable({
  providedIn: "root",
})
export class AuthService {
  readonly #http = inject(HttpClient);
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

  readonly loginSubject = new BehaviorSubject<null | LoginFormValues>(null);
  readonly #loginAction$ = this.loginSubject.asObservable();

  readonly registerSubject = new BehaviorSubject<null | RegisterFormValues>(
    null,
  );
  readonly #registerAction$ = this.registerSubject.asObservable();

  readonly logoutSubject = new BehaviorSubject<null | "logout">(null);
  readonly #logoutAction$ = this.logoutSubject.asObservable();

  readonly loginResponse$ = this.#loginAction$.pipe(
    switchMap((form) => {
      if (form === null) {
        return INITIAL_IDLE_STATE;
      }

      const loginRequest$ = this.#http
        .post<UserWithoutPassword>("https://api.example.com/login", form, {
          withCredentials: false,
        })
        .pipe(
          map<UserWithoutPassword, SuccessLoginResponse>((response) => ({
            state: "success",
            data: response,
          })),
          catchError((errorResponse) => handleObservableError(errorResponse)),
        );

      return loginRequest$.pipe(
        startWith<LoginResponseWithState>({ state: "pending" }),
        tap((response) => {
          if (response.state === "success") {
            this.#userState.set(response.data);
          }
        }),
        catchError((error: HandledObservableError) =>
          of<ErrorResponse>({
            state: "error",
            message: error.message,
          }),
        ),
      );
    }),
  );

  readonly registerResponse$ = this.#registerAction$.pipe(
    switchMap((form) => {
      if (form === null) {
        return INITIAL_IDLE_STATE;
      }

      const id = globalThis.crypto.randomUUID();

      const registerRequest$ = this.#http
        .put<void>(`https://api.example.com/user/${id}`, form, {
          withCredentials: false,
        })
        .pipe(
          map<void, SuccessRegisterResponse>(() => ({
            state: "success",
            data: null,
          })),
          catchError((errorResponse) => handleObservableError(errorResponse)),
        );

      return registerRequest$.pipe(
        startWith<RegisterResponseWithState>({ state: "pending" }),
        tap((response) => {
          if (response.state === "success") {
            this.#userState.set({
              id,
              username: form.username,
              source: "registration",
            });
          }
        }),
        catchError((error: HandledObservableError) =>
          of<ErrorResponse>({
            state: "error",
            message: error.message,
          }),
        ),
      );
    }),
  );

  readonly logoutResponse$ = this.#logoutAction$.pipe(
    switchMap((emittedValue) => {
      if (emittedValue === null) {
        return INITIAL_IDLE_STATE;
      }

      const logoutRequest$ = this.#http
        .post<void>("https://api.example.com/logout", null, {
          withCredentials: true,
        })
        .pipe(
          map<void, SuccessLogoutResponse>(() => ({
            state: "success",
            data: null,
          })),
          catchError((errorResponse) => handleObservableError(errorResponse)),
        );

      return logoutRequest$.pipe(
        startWith<LogoutResponseWithState>({ state: "pending" }),
        tap((response) => {
          if (response.state === "success") {
            this.#userState.set(null);
          }
        }),
        catchError((error: HandledObservableError) =>
          of<ErrorResponse>({
            state: "error",
            message: error.message,
          }),
        ),
      );
    }),
  );
}
