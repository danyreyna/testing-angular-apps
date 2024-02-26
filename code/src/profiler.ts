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
