import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  type OnDestroy,
  type OnInit,
} from "@angular/core";
import { Subscription } from "rxjs";
import {
  type ErrorResponse,
  isErrorResponse,
  isSuccessResponse,
} from "../common/response-state/response-states";
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
    @if (
      loginSubmissionService.loginResponseWithState()
        | typeGuard: isSuccessResponse;
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
      @if (
        loginSubmissionService.loginResponseWithState().state === "pending"
      ) {
        <app-spinner />
      }

      @if (
        loginSubmissionService.loginResponseWithState()
          | typeGuard: isErrorResponse;
        as errorResponse
      ) {
        <div role="alert" class="color-red">
          {{ errorResponse.message }}
        </div>
      }
    </div>
  `,
})
export class LoginSubmissionComponent implements OnInit, OnDestroy {
  protected readonly loginSubmissionService = inject(LoginSubmissionService);
  #postLoginSubscription: null | Subscription = null;

  ngOnInit() {
    this.#postLoginSubscription =
      this.loginSubmissionService.postLogin$.subscribe();
  }

  ngOnDestroy() {
    this.#postLoginSubscription?.unsubscribe();
  }

  protected handleSubmit(formValues: LoginFormValues) {
    this.loginSubmissionService.loginSubject.next(formValues);
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
