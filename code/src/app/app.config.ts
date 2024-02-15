import { provideHttpClient } from "@angular/common/http";
import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { provideAuth } from "./common/auth/auth.service.provider";
import { provideTheme } from "./common/theme.service.provider";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAuth(),
    provideTheme("dark"),
  ],
};
