import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";

type FormElements = HTMLFormControlsCollection & {
  username: HTMLInputElement;
  password: HTMLInputElement;
};

export type LoginFormValues = {
  username: FormElements["username"]["value"];
  password: FormElements["password"]["value"];
};

@Component({
  selector: "app-login-template-driven",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (username() === "") {
      <form #loginForm="ngForm" (ngSubmit)="handleSubmit(loginForm)">
        <div>
          <label for="username-field">Username</label>
          <input id="username-field" name="username" ngModel type="text" />
        </div>
        <div>
          <label for="password-field">Password</label>
          <input id="password-field" name="password" ngModel type="password" />
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
export class LoginTemplateDrivenComponent {
  protected readonly username = signal("");
  protected handleSubmit(loginForm: NgForm) {
    const values: LoginFormValues = loginForm.form.value;

    this.username.set(values.username);
  }
}
