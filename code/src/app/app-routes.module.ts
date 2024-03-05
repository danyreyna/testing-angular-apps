import { ErrorHandler, NgModule } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AppRoutesComponent } from "./app-routes.component";
import { ErrorBoundaryHandler } from "./common/error/error-boundary";

/*
 * Have to declare a module because `ErrorHandler` can't be scoped with standalone components.
 */
@NgModule({
  declarations: [AppRoutesComponent],
  imports: [RouterOutlet],
  providers: [{ provide: ErrorHandler, useClass: ErrorBoundaryHandler }],
  exports: [AppRoutesComponent],
})
export class AuthenticatedAppModule {}
