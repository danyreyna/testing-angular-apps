import { CommonModule } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import {
  AuthService,
  type LoginResponseWithState,
} from "./common/auth/auth.service";
import {
  ButtonComponent,
  buttonStyles,
  type ButtonVariant,
} from "./common/components/button.component";
import { ErrorMessageComponent } from "./common/components/error-message.component";
import { FormGroupComponent } from "./common/components/form-group.component";
import { InputComponent } from "./common/components/input.component";
import { LogoComponent } from "./common/components/logo.component";
import { ModalComponent } from "./common/components/modal/modal.component";
import { ModalService } from "./common/components/modal/modal.service";
import { SpinnerComponent } from "./common/components/spinner.component";
import {
  type ErrorResponse,
  isErrorResponse,
} from "./common/response-state/response-states";
import { type TypeGuard, TypeGuardPipe } from "./common/type-guard.pipe";
import type { User } from "./common/user";

@Component({
  selector: "button[app-login-form-submit-button]",
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  /*
   * Go and complain to the Angular team.
   * https://github.com/angular/angular/issues/53809
   */
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    type: "submit",
  },
  styles: `
      ${buttonStyles}

      :host {
        display: flex;
      }
    `,
  template: `
    <ng-content />
    @if (isLoading) {
      <app-spinner [ngStyle]="{ 'margin-left.px': 5 }" />
    }
  `,
})
export class LoginFormSubmitButtonComponent {
  @Input()
  variant: ButtonVariant = "primary";

  @Input({ required: true, transform: booleanAttribute })
  isLoading = false;
}

export type LoginFormValues = Pick<User, "username" | "password">;

@Component({
  selector: "form[app-login-form]",
  standalone: true,
  imports: [
    CommonModule,
    FormGroupComponent,
    InputComponent,
    FormsModule,
    ErrorMessageComponent,
    TypeGuardPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  /*
   * Go and complain to the Angular team.
   * https://github.com/angular/angular/issues/53809
   */
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    "(ngSubmit)": "handleSubmit()",
  },
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }

      :host > app-form-group,
      div,
      app-error-message {
        margin: 10px auto;
        width: 100%;
        max-width: 300px;
      }
    `,
  ],
  template: `
    <app-form-group>
      <label for="username">Username</label>
      <input app-input id="username" ngModel name="username" />
    </app-form-group>
    <app-form-group>
      <label for="password">Password</label>
      <input app-input id="password" ngModel name="password" type="password" />
    </app-form-group>
    <div>
      <ng-content select="[content-submit-button]" />
    </div>
    @if (loginResponse | typeGuard: isErrorResponse; as errorResponse) {
      <app-error-message [errorMessage]="errorResponse.message" />
    }
  `,
})
export class LoginFormComponent {
  readonly #loginForm = inject(NgForm);

  @Output()
  formSubmitted = new EventEmitter<LoginFormValues>();

  @Input({ required: true })
  loginResponse!: LoginResponseWithState;

  protected handleSubmit() {
    const values: LoginFormValues = this.#loginForm.form.value;

    this.formSubmitted.emit(values);
  }

  protected readonly isErrorResponse: TypeGuard<
    LoginResponseWithState,
    ErrorResponse
  > = isErrorResponse;
}

@Component({
  selector: "app-unauthenticated-app",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LogoComponent,
    ModalComponent,
    LoginFormComponent,
    ButtonComponent,
    LoginFormSubmitButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100vh;
      }
      .buttons-container {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-gap: 0.75rem;
      }
    `,
  ],
  template: `
    @if (auth.loginResponse$ | async; as loginResponse) {
      <app-logo size="80" />
      <h1>Bookshelf</h1>
      <div class="buttons-container">
        <button app-button variant="primary" (click)="handleLoginClick()">
          Login
        </button>

        <button app-button variant="secondary" (click)="handleRegisterClick()">
          Register
        </button>
      </div>

      <ng-template #loginFormDialogRef>
        <app-modal ariaLabel="Login form" title="Login">
          <form
            app-login-form
            (formSubmitted)="auth.loginSubject.next($event)"
            [loginResponse]="loginResponse"
          >
            <button
              content-submit-button
              variant="primary"
              app-login-form-submit-button
              [isLoading]="loginResponse.state === 'pending'"
            >
              Login
            </button>
          </form>
        </app-modal>
      </ng-template>
    }
  `,
})
export class UnauthenticatedAppComponent {
  protected readonly auth = inject(AuthService);
  readonly #modal = inject(ModalService);

  @ViewChild("loginFormDialogRef")
  loginFormDialogRef!: TemplateRef<ModalComponent>;

  protected handleLoginClick() {
    this.#modal.open(this.loginFormDialogRef);
  }

  protected handleRegisterClick() {}
}
