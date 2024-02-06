import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError } from "rxjs";
import { handleHttpError } from "../common/handle-http-error";
import type { LoginFormValues } from "./login-submission-form.component";

export type LoginResponse = {
  username: string;
};

@Injectable({
  providedIn: "root",
})
export class LoginSubmissionService {
  readonly #http = inject(HttpClient);
  postLogin(formData: LoginFormValues) {
    return this.#http
      .post<LoginResponse>(
        "https://auth-provider.example.com/api/login",
        formData,
      )
      .pipe(catchError((errorResponse) => handleHttpError(errorResponse)));
  }
}
