import { isDevMode } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";
import { AngularProfiler, setProfilerInstance } from "./app/common/profiler";

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
      const [componentRef] = applicationRef.components;
      const profiler = new AngularProfiler(componentRef);

      setProfilerInstance(profiler);
    })
    .catch((err) => console.error(err));
});
