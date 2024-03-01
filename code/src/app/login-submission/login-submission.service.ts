import { Injectable } from "@angular/core";
import {
  getHttpCommand,
  type HttpCommand,
} from "../common/response-state/http/command";
import type { HttpSuccessState } from "../common/response-state/http/state";
import type { LoginFormValues } from "./login-submission-form.component";

type LoginResponse = {
  username: string;
};
export type LoginResponseWithState = HttpCommand<LoginResponse>;
export type SuccessLoginResponse = HttpSuccessState<LoginResponse>;

@Injectable({
  providedIn: "root",
})
export class LoginSubmissionService {
  readonly #loginCommand = getHttpCommand<LoginResponse, LoginFormValues>(
    "https://auth-provider.example.com/api/login",
    { method: "post" },
  );
  readonly loginSubject = this.#loginCommand.subject;
  readonly login$ = this.#loginCommand.observable$;
}
