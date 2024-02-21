import { makeEnvironmentProviders } from "@angular/core";
import { AuthService } from "./auth.service";

export function provideAuth() {
  return makeEnvironmentProviders([AuthService]);
}
