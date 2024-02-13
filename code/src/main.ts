import { isDevMode } from "@angular/core";
import { bootstrapApplication, enableDebugTools } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

async function prepareApp() {
  if (isDevMode()) {
    const { worker } = await import("./mocks/browser");
    return worker.start({
      onUnhandledRequest: "bypass",
    });
  }

  return Promise.resolve();
}

prepareApp().then(() => {
  bootstrapApplication(AppComponent, appConfig)
    .then((applicationRef) => {
      /*
       * By enabling this, you can call `ng.profiler.timeChangeDetection()` in the browser's console.
       * It tells Angular's change detection to run for about 500ms.
       * Then it prints an object with:
       * `numTicks`, how many times Angular triggered change detection.
       * `msPerTick`, the average time change detection took.
       * Tip: Don't let the change detection cycle go beyond 10ms.
       */

      const [componentRef] = applicationRef.components;
      enableDebugTools(componentRef);
    })
    .catch((err) => console.error(err));
});
