import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { catchError, EMPTY, map, startWith } from "rxjs";
import {
  type ErrorResponse,
  isErrorResponse,
  isSuccessResponse,
  type ResponseWithStatus,
  type SuccessResponse,
} from "../common/response-with-status";
import { type TypeGuard, TypeGuardPipe } from "../common/type-guard.pipe";
import { SpinnerComponent } from "../spinner/spinner.component";
import {
  type LoginFormValues,
  LoginSubmissionFormComponent,
} from "./login-submission-form.component";
import {
  type LoginResponse,
  LoginSubmissionService,
} from "./login-submission.service";

type LoginResponseWithStatus = ResponseWithStatus<LoginResponse>;
type SuccessLoginResponse = SuccessResponse<LoginResponse>;

@Component({
  selector: "app-login-submission",
  standalone: true,
  imports: [
    CommonModule,
    LoginSubmissionFormComponent,
    SpinnerComponent,
    TypeGuardPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .height-200 {
      height: 200px;
    }

    .color-red {
      color: red;
    }
  `,
  template: `
    @if (
      loginResponse() | typeGuard: isSuccessResponse;
      as successLoginResponse
    ) {
      <div>
        Welcome
        <strong>{{ successLoginResponse.data.username }}</strong>
      </div>
    } @else {
      <app-login-submission-form (formSubmitted)="handleSubmit($event)" />
    }

    <div class="height-200">
      @if (loginResponse().status === "pending") {
        <app-spinner />
      }

      @if (loginResponse() | typeGuard: isErrorResponse; as errorResponse) {
        <div role="alert" class="color-red">
          {{ errorResponse.message }}
        </div>
      }
    </div>
  `,
})
export class LoginSubmissionComponent {
  readonly #loginSubmissionService = inject(LoginSubmissionService);

  protected readonly loginResponse = signal<LoginResponseWithStatus>({
    status: "idle",
  });

  protected handleSubmit(formValues: LoginFormValues) {
    this.#loginSubmissionService
      .postLogin(formValues)
      .pipe(
        map((response) => ({ status: "success" as const, data: response })),
        catchError((error) => {
          this.loginResponse.set({
            status: "error",
            message: error.message,
          });

          return EMPTY;
        }),
        startWith({ status: "pending" as const }),
      )
      .subscribe({
        next: (response) => {
          this.loginResponse.set(response);
        },
      });
  }

  protected readonly isSuccessResponse: TypeGuard<
    LoginResponseWithStatus,
    SuccessLoginResponse
  > = isSuccessResponse;

  protected readonly isErrorResponse: TypeGuard<
    LoginResponseWithStatus,
    ErrorResponse
  > = isErrorResponse;
}
