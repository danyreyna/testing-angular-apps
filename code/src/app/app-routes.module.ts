import { ErrorHandler, NgModule } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import {
  AppRoutesComponent,
  ErrorFallbackComponent,
} from "./app-routes.component";
import {
  ErrorBoundaryComponent,
  ErrorBoundaryHandler,
} from "./common/error/error-boundary";

/*
 * Have to declare a module because `ErrorHandler` can't be scoped with standalone components.
 */
@NgModule({
  declarations: [AppRoutesComponent],
  imports: [ErrorBoundaryComponent, ErrorFallbackComponent, RouterOutlet],
  providers: [{ provide: ErrorHandler, useClass: ErrorBoundaryHandler }],
  exports: [AppRoutesComponent],
})
export class AppRoutesModule {}
