import { provideHttpClient } from "@angular/common/http";
import {
  type ApplicationConfig,
  ErrorHandler,
  Injectable,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { provideAuth } from "./common/auth/auth.service.provider";
import { handleError } from "./common/error/handle-error";
import { provideTheme } from "./common/theme/theme.service.provider";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error) {
    console.log("Hello from GlobalErrorHandler", error);
    handleError(error);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAuth(),
    provideTheme("dark"),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
