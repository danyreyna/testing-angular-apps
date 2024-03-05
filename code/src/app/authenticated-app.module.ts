import { CommonModule } from "@angular/common";
import { ErrorHandler, NgModule } from "@angular/core";
import { AppRoutesModule } from "./app-routes.module";
import {
  AuthenticatedAppComponent,
  NavComponent,
} from "./authenticated-app.component";
import { ButtonComponent } from "./common/components/button.component";
import {
  ErrorBoundaryComponent,
  ErrorBoundaryHandler,
} from "./common/error/error-boundary";
import { FullPageErrorFallbackComponent } from "./common/error/full-page-error-fallback.component";

/*
 * Have to declare a module because `ErrorHandler` can't be scoped with standalone components.
 */
@NgModule({
  declarations: [AuthenticatedAppComponent],
  imports: [
    CommonModule,
    AppRoutesModule,
    ButtonComponent,
    ErrorBoundaryComponent,
    FullPageErrorFallbackComponent,
    NavComponent,
  ],
  providers: [{ provide: ErrorHandler, useClass: ErrorBoundaryHandler }],
  exports: [AuthenticatedAppComponent],
})
export class AuthenticatedAppModule {}
