import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import {
  getHttpCommand,
  httpPost,
} from "../common/response-state/http/command";
import type {
  HttpCommand,
  HttpCommandErrorState,
  HttpCommandSuccessState,
} from "../common/response-state/http/command-state";
import type { LoginFormValues } from "./login-submission-form.component";

type LoginResponse = {
  username: string;
};
type LoginVariables = { body: LoginFormValues };

export type LoginResponseWithState = HttpCommand<LoginResponse, LoginVariables>;
export type SuccessLoginResponse = HttpCommandSuccessState<
  LoginResponse,
  LoginVariables
>;
export type ErrorLoginResponse = HttpCommandErrorState<LoginVariables>;

@Injectable()
export class LoginSubmissionService {
  readonly #http = inject(HttpClient);

  readonly loginCommand = getHttpCommand({
    commandFn: ({ body }: LoginVariables) =>
      httpPost<LoginResponse, LoginFormValues>(
        "https://auth-provider.example.com/api/login",
        { http: this.#http, body },
      ),
  });
}
