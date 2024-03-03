import { inject, Injectable, signal } from "@angular/core";
import { tap } from "rxjs";
import type { UserFormValues } from "../../unauthenticated-app.component";
import { BootstrapService } from "../bootstrap.service";
import {
  getHttpCommand,
  type HttpCommand,
} from "../response-state/http/command";
import type { User, UserWithoutPassword } from "../user";

export type LoginResponseWithState = HttpCommand<UserWithoutPassword>;

export type RegisterResponseWithState = HttpCommand<UserWithoutPassword>;
export type RegisterRequestValues = UserFormValues & Pick<User, "source">;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  readonly #bootstrapService = inject(BootstrapService);

  readonly #userState = signal<null | UserWithoutPassword>(null);
  readonly user = this.#userState.asReadonly();

  readonly resetBootstrapCache = this.#bootstrapService.resetBootstrapCache;
  readonly bootstrap$ = this.#bootstrapService.bootstrap$.pipe(
    tap((bootstrapWithState) => {
      if (
        bootstrapWithState.state === "success" &&
        bootstrapWithState.data !== null
      ) {
        this.#userState.set(bootstrapWithState.data.user);
      }
    }),
  );

  readonly #loginCommand = getHttpCommand<UserWithoutPassword, UserFormValues>(
    "https://api.example.com/login",
    {
      method: "post",
      options: {
        withCredentials: true,
      },
    },
  );
  readonly loginSubject = this.#loginCommand.subject;
  readonly login$ = this.#loginCommand.observable$.pipe(
    tap((httpResult) => {
      if (httpResult.state === "success") {
        this.#userState.set(httpResult.response.body);
      }
    }),
  );

  readonly #registerCommand = getHttpCommand<
    UserWithoutPassword,
    RegisterRequestValues,
    {
      pathParams: { id: string };
    }
  >(
    () => {
      const id = globalThis.crypto.randomUUID();
      return {
        href: `https://api.example.com/register/${id}`,
        pathParams: { id },
      };
    },
    {
      method: "post",
      options: {
        withCredentials: true,
      },
    },
  );
  readonly registerSubject = this.#registerCommand.subject;
  readonly register$ = this.#registerCommand.observable$.pipe(
    tap((httpResult) => {
      if (httpResult.state !== "success") {
        return;
      }

      const subjectValue = this.#registerCommand.subject.value;
      if (subjectValue === null) {
        return;
      }

      const { id } = this.#registerCommand.url().pathParams;
      const { username, source } = subjectValue;

      this.#userState.set({
        id,
        username,
        source,
      });
    }),
  );

  readonly #logoutCommand = getHttpCommand<null, "logout">(
    "https://api.example.com/logout",
    {
      method: "post",
      shouldSendBodyFromSubject: false,
      options: {
        withCredentials: true,
      },
    },
  );
  readonly logoutSubject = this.#logoutCommand.subject;
  readonly logout$ = this.#logoutCommand.observable$.pipe(
    tap((httpResult) => {
      if (httpResult.state === "success") {
        this.#userState.set(null);
      }
    }),
  );
}
