import { CommonModule } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  type OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { combineLatest, map, type Observable, tap } from "rxjs";
import {
  AuthService,
  type LoginResponseWithState,
  type LoginVariables,
  type RegisterResponseWithState,
  type RegisterVariables,
} from "./common/auth/auth.service";
import {
  ButtonComponent,
  type ButtonVariant,
  getButtonStyles,
} from "./common/components/button.component";
import { FormGroupComponent } from "./common/components/form-group.component";
import { InputComponent } from "./common/components/input.component";
import { LogoComponent } from "./common/components/logo.component";
import { ModalComponent } from "./common/components/modal/modal.component";
import { ModalService } from "./common/components/modal/modal.service";
import { SpinnerComponent } from "./common/components/spinner.component";
import { ErrorMessageComponent } from "./common/error/error-message.component";
import {
  type HttpCommandErrorState,
  isHttpCommandError,
} from "./common/response-state/http/command-state";
import { type TypeGuard, TypeGuardPipe } from "./common/type-guard.pipe";
import type { User } from "./common/user";

@Component({
  selector: "button[app-user-form-submit-button]",
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
  styles: getButtonStyles(`
    display: flex;
  `),
  template: `
    <ng-content />
    @if (isLoading) {
      <app-spinner [ngStyle]="{ 'margin-left.px': 5 }" />
    }
  `,
})
export class UserFormSubmitButtonComponent {
  @Input()
  variant: ButtonVariant = "primary";

  @Input({ required: true, transform: booleanAttribute })
  isLoading = false;
}

export type UserFormValues = Pick<User, "username" | "password">;

@Component({
  selector: "form[app-user-form]",
  standalone: true,
  imports: [
    CommonModule,
    ErrorMessageComponent,
    FormGroupComponent,
    FormsModule,
    InputComponent,
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
  styles: `
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
      <ng-content select="[submit-button-slot]" />
    </div>
    @if (commandResponse | typeGuard: isHttpCommandError; as errorResponse) {
      <app-error-message [errorMessage]="errorResponse.error.message" />
    }
  `,
})
export class UserFormComponent {
  readonly #userForm = inject(NgForm);

  @Output()
  formSubmitted = new EventEmitter<UserFormValues>();

  @Input({ required: true })
  commandResponse!: LoginResponseWithState | RegisterResponseWithState;

  protected handleSubmit() {
    const values: UserFormValues = this.#userForm.form.value;

    this.formSubmitted.emit(values);
  }

  protected readonly isHttpCommandError: TypeGuard<
    LoginResponseWithState | RegisterResponseWithState,
    HttpCommandErrorState<LoginVariables | RegisterVariables>
  > = isHttpCommandError;
}

@Component({
  selector: "app-unauthenticated-app",
  standalone: true,
  imports: [
    ButtonComponent,
    CommonModule,
    FormsModule,
    LogoComponent,
    ModalComponent,
    UserFormComponent,
    UserFormSubmitButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ModalService],
  styles: `
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
  template: `
    @if (viewModel$ | async; as viewModel) {
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
            app-user-form
            (formSubmitted)="handleLoginSubmit($event)"
            [commandResponse]="viewModel.login"
          >
            <button
              submit-button-slot
              app-user-form-submit-button
              variant="primary"
              [isLoading]="viewModel.login.state === 'pending'"
            >
              Login
            </button>
          </form>
        </app-modal>
      </ng-template>

      <ng-template #registerFormDialogRef>
        <app-modal ariaLabel="Registration form" title="Register">
          <form
            app-user-form
            (formSubmitted)="handleRegisterSubmit($event)"
            [commandResponse]="viewModel.register"
          >
            <button
              submit-button-slot
              app-user-form-submit-button
              variant="secondary"
              [isLoading]="viewModel.register.state === 'pending'"
            >
              Register
            </button>
          </form>
        </app-modal>
      </ng-template>
    }
  `,
})
export class UnauthenticatedAppComponent implements OnDestroy {
  readonly #auth = inject(AuthService);
  readonly #modal = inject(ModalService);

  readonly #login$ = this.#auth.loginCommand.observable$.pipe(
    tap((response) => {
      if (response.state === "success") {
        this.#modal.closeAll();
      }
    }),
  );

  readonly #register$ = this.#auth.registerCommand.observable$.pipe(
    tap((response) => {
      if (response.state === "success") {
        this.#modal.closeAll();
      }
    }),
  );

  protected readonly viewModel$: Observable<{
    login: LoginResponseWithState;
    register: RegisterResponseWithState;
  }> = combineLatest([this.#login$, this.#register$]).pipe(
    map(([login, register]) => ({
      login,
      register,
    })),
  );

  @ViewChild("loginFormDialogRef")
  loginFormDialogRef!: TemplateRef<ModalComponent>;

  protected handleLoginClick() {
    this.#modal.open(this.loginFormDialogRef);
  }

  protected handleLoginSubmit(userFormValues: UserFormValues) {
    this.#auth.loginCommand.run({ body: userFormValues });
  }

  @ViewChild("registerFormDialogRef")
  registerFormDialogRef!: TemplateRef<ModalComponent>;

  protected handleRegisterClick() {
    this.#modal.open(this.registerFormDialogRef);
  }

  #userId = globalThis.crypto.randomUUID();

  protected handleRegisterSubmit(userFormValues: UserFormValues) {
    this.#auth.registerCommand.run({
      urlParams: {
        pathParams: {
          userId: this.#userId,
        },
      },
      body: {
        ...userFormValues,
        source: "registration",
      },
    });
  }

  ngOnDestroy() {
    this.#auth.cleanup();
  }
}
