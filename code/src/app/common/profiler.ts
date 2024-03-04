import { ApplicationRef, ComponentRef } from "@angular/core";

/*
 * `ChangeDetectionPerfRecord` and `AngularProfiler` adapted from
 *  https://github.com/angular/angular/blob/main/packages/platform-browser/src/browser/tools/common_tools.ts
 */
export type ChangeDetectionPerfRecord = {
  msPerTick: number;
  numTicks: number;
};

const MIN_CHANGE_DETECTION_TICKS = 5;
const MIN_CHANGE_DETECTION_TIME_MS = 500;

export class AngularProfiler {
  #appRef: ApplicationRef;

  constructor(ref: ComponentRef<unknown>) {
    this.#appRef = ref.injector.get(ApplicationRef);
  }

  /**
   * Exercises change detection in a loop and then prints the average amount of
   * time in milliseconds how long a single round of change detection takes for
   * the current state of the UI. It runs a minimum of 5 rounds for a minimum
   * of 500 milliseconds.
   */
  timeChangeDetection(): ChangeDetectionPerfRecord {
    const start = performance.now();

    let numTicks = 0;
    while (
      numTicks < MIN_CHANGE_DETECTION_TICKS ||
      performance.now() - start < MIN_CHANGE_DETECTION_TIME_MS
    ) {
      this.#appRef.tick();
      numTicks += 1;
    }

    const end = performance.now();

    const msPerTick = (end - start) / numTicks;

    return { msPerTick, numTicks };
  }
}

let profilerInstance: null | AngularProfiler = null;

export function setProfilerInstance(instance: AngularProfiler) {
  profilerInstance = instance;
}

export type SendToMonitoringTool = (
  changeDetectionPerfRecord: ChangeDetectionPerfRecord,
) => void;

export function startPerformanceMonitor(
  interval: number,
  sendToMonitoringTool: SendToMonitoringTool,
) {
  const intervalId: number = setInterval(() => {
    if (profilerInstance === null) {
      return;
    }

    /*
     * Unlike the React Profiler's `onRender` callback,
     * Angular doesn't provide a straightforward way to profile everytime components update.
     * So we'll call `AngularProfiler.timeChangeDetection()` here.
     *
     * https://angular.dev/guide/components/lifecycle
     * And before you think of using a lifecycle hook, keep in mind that:
     *   - `ngOnChanges` only runs after inputs change.
     *   - `ngDoCheck` runs very frequently and can significantly impact your page's performance.
     *     - Avoid defining this hook whenever possible, only using it when you have no alternative.
     *   - Calling `AngularProfiler.timeChangeDetection()` in `afterRender` is NOT the way to go.
     *     - A render will trigger change detection, that change detection will trigger at least one render, that render will trigger change detection...
     *     - This results in `ApplicationRef.tick()` throwing "ApplicationRef.tick is called recursively"
     *     - And even if you catch and bypass this error, this approach slows down the app.
     */
    const changeDetectionPerfRecord = profilerInstance.timeChangeDetection();

    sendToMonitoringTool(changeDetectionPerfRecord);
  }, interval);

  return intervalId;
}
