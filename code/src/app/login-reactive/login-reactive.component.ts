import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  signal,
} from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule } from "@angular/forms";

type FormElements = HTMLFormControlsCollection & {
  username: HTMLInputElement;
  password: HTMLInputElement;
};

export type LoginFormValues = {
  username: FormElements["username"]["value"];
  password: FormElements["password"]["value"];
};

@Component({
  selector: "app-login-reactive",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (username() === "") {
      <form (ngSubmit)="handleSubmit()" [formGroup]="loginForm">
        <div>
          <label for="username-field">Username</label>
          <input
            id="username-field"
            name="username"
            type="text"
            formControlName="username"
          />
        </div>
        <div>
          <label for="password-field">Password</label>
          <input
            id="password-field"
            name="password"
            type="password"
            formControlName="password"
          />
        </div>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    } @else {
      <h1>Welcome, {{ username() }}!</h1>
    }
  `,
})
export class LoginReactiveComponent {
  readonly #formBuilder = inject(NonNullableFormBuilder);

  protected readonly username = signal("");

  protected loginForm = this.#formBuilder.group({
    username: "",
    password: "",
  });

  protected handleSubmit() {
    const {
      value: { username: submittedUsername },
    } = this.loginForm;

    if (!this.loginForm.valid || submittedUsername === undefined) {
      return;
    }

    this.username.set(submittedUsername);
  }
}
