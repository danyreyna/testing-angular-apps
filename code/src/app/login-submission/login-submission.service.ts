import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  map,
  type Observable,
  of,
  startWith,
  switchMap,
} from "rxjs";
import {
  type HandledObservableError,
  handleObservableError,
} from "../common/handle-observable-error";
import type { CommandWithState } from "../common/response-state/command-with-state";
import type {
  ErrorResponse,
  IdleState,
  SuccessResponse,
} from "../common/response-state/response-states";
import type { LoginFormValues } from "./login-submission-form.component";

type LoginResponse = {
  username: string;
};

export type LoginResponseWithState = CommandWithState<LoginResponse>;
export type SuccessLoginResponse = SuccessResponse<LoginResponse>;

const INITIAL_IDLE_STATE = of<IdleState>({ state: "idle" });

@Injectable({
  providedIn: "root",
})
export class LoginSubmissionService {
  readonly #http = inject(HttpClient);

  readonly loginSubject = new BehaviorSubject<null | LoginFormValues>(null);
  readonly #loginAction$ = this.loginSubject.asObservable();

  readonly loginResponseWithState$: Observable<LoginResponseWithState> =
    this.#loginAction$.pipe(
      switchMap((formData) => {
        if (formData === null) {
          return INITIAL_IDLE_STATE;
        }

        const loginRequest$ = this.#http
          .post<LoginResponse>(
            "https://auth-provider.example.com/api/login",
            formData,
          )
          .pipe(
            map<LoginResponse, SuccessLoginResponse>((response) => ({
              state: "success",
              data: response,
            })),
            catchError((errorResponse) => handleObservableError(errorResponse)),
          );

        return loginRequest$.pipe(
          startWith<LoginResponseWithState>({ state: "pending" }),
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
