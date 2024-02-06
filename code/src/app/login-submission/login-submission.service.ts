import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import {
  catchError,
  EMPTY,
  map,
  startWith,
  Subject,
  switchMap,
  tap,
} from "rxjs";
import {
  type HandledObservableError,
  handleObservableError,
} from "../common/handle-observable-error";
import type { CommandWithState } from "../common/response-state/command-with-state";
import type { SuccessResponse } from "../common/response-state/response-states";
import type { LoginFormValues } from "./login-submission-form.component";

type LoginResponse = {
  username: string;
};

export type LoginResponseWithState = CommandWithState<LoginResponse>;
export type SuccessLoginResponse = SuccessResponse<LoginResponse>;

@Injectable({
  providedIn: "root",
})
export class LoginSubmissionService {
  readonly #http = inject(HttpClient);

  readonly loginResponseWithState = signal<LoginResponseWithState>({
    state: "idle",
  });

  readonly loginSubject = new Subject<LoginFormValues>();
  readonly #loginAction$ = this.loginSubject.asObservable();

  readonly #loginRequest$ = this.#loginAction$.pipe(
    switchMap((formData) =>
      this.#http.post<LoginResponse>(
        "https://auth-provider.example.com/api/login",
        formData,
      ),
    ),
    map<LoginResponse, SuccessLoginResponse>((response) => ({
      state: "success",
      data: response,
    })),
    catchError((errorResponse) => handleObservableError(errorResponse)),
  );
  readonly postLogin$ = this.#loginRequest$.pipe(
    startWith<LoginResponseWithState>({ state: "pending" }),
    tap((responseWithState) => {
      this.loginResponseWithState.set(responseWithState);
    }),
    catchError((error: HandledObservableError) => {
      this.loginResponseWithState.set({
        state: "error",
        message: error.message,
      });

      return EMPTY;
    }),
  );
}
