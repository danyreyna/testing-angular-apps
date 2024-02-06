import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { catchError, EMPTY, map, startWith } from "rxjs";
import { type CommandWithState } from "../common/response-state/command-with-state";
import {
  type ErrorResponse,
  isErrorResponse,
  isSuccessResponse,
  type SuccessResponse,
} from "../common/response-state/response-states";
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

type LoginResponseWithState = CommandWithState<LoginResponse>;
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
      @if (loginResponse().state === "pending") {
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

  protected readonly loginResponse = signal<LoginResponseWithState>({
    state: "idle",
  });

  protected handleSubmit(formValues: LoginFormValues) {
    this.#loginSubmissionService
      .postLogin(formValues)
      .pipe(
        map((response) => ({ state: "success" as const, data: response })),
        catchError((error) => {
          this.loginResponse.set({
            state: "error",
            message: error.message,
          });

          return EMPTY;
        }),
        startWith({ state: "pending" as const }),
      )
      .subscribe({
        next: (response) => {
          this.loginResponse.set(response);
        },
      });
  }

  protected readonly isSuccessResponse: TypeGuard<
    LoginResponseWithState,
    SuccessLoginResponse
  > = isSuccessResponse;

  protected readonly isErrorResponse: TypeGuard<
    LoginResponseWithState,
    ErrorResponse
  > = isErrorResponse;
}
