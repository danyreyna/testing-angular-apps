import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  type HttpErrorState,
  isHttpError,
  isHttpSuccess,
} from "../common/response-state/http/state";
import { type TypeGuard, TypeGuardPipe } from "../common/type-guard.pipe";
import { SpinnerComponent } from "../spinner/spinner.component";
import {
  type LoginFormValues,
  LoginSubmissionFormComponent,
} from "./login-submission-form.component";
import {
  type LoginResponseWithState,
  LoginSubmissionService,
  type SuccessLoginResponse,
} from "./login-submission.service";

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
    @if (loginSubmissionService.login$ | async; as login) {
      @if (login | typeGuard: isHttpSuccess; as httpSuccess) {
        <div>
          Welcome
          <strong>{{ httpSuccess.response.body.username }}</strong>
        </div>
      } @else {
        <app-login-submission-form (formSubmitted)="handleSubmit($event)" />
      }

      <div class="height-200">
        @if (login.state === "pending") {
          <app-spinner />
        }

        @if (login | typeGuard: isHttpError; as httpError) {
          <div role="alert" class="color-red">
            {{ httpError.error.message }}
          </div>
        }
      </div>
    }
  `,
})
export class LoginSubmissionComponent {
  protected readonly loginSubmissionService = inject(LoginSubmissionService);

  protected handleSubmit(formValues: LoginFormValues) {
    this.loginSubmissionService.loginSubject.next(formValues);
  }

  protected readonly isHttpSuccess: TypeGuard<
    LoginResponseWithState,
    SuccessLoginResponse
  > = isHttpSuccess;

  protected readonly isHttpError: TypeGuard<
    LoginResponseWithState,
    HttpErrorState
  > = isHttpError;
}
