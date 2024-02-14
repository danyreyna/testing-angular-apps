import { Inject, Injectable, InjectionToken, signal } from "@angular/core";

export type InitialCounterValues = {
  initialCount?: number;
  step?: number;
};

export const INITIAL_COUNTER_VALUES = new InjectionToken<InitialCounterValues>(
  "initialCounterValues",
);

@Injectable({
  providedIn: "root",
})
export class CounterService {
  readonly #countState = signal(0);
  readonly count = this.#countState.asReadonly();

  readonly #step = signal(1);

  constructor(
    @Inject(INITIAL_COUNTER_VALUES)
    private readonly initialCounterValues: InitialCounterValues = {},
  ) {
    const { initialCount = 0, step = 1 } = initialCounterValues;

    this.#countState.set(initialCount);
    this.#step.set(step);
  }

  increment() {
    this.#countState.update((currentCount) => currentCount + this.#step());
  }

  decrement() {
    this.#countState.update((currentCount) => currentCount - this.#step());
  }

  setStep(newStep: number) {
    this.#step.set(newStep);
  }
}
