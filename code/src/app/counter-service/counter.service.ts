import { inject, Injectable, InjectionToken, signal } from "@angular/core";

export type InitialCounterValues = {
  initialCount?: number;
  step?: number;
};

export const INITIAL_COUNTER_VALUES = new InjectionToken<InitialCounterValues>(
  "initialCounterValues",
);

@Injectable()
export class CounterService {
  readonly #initialCounterValues = inject<null | InitialCounterValues>(
    INITIAL_COUNTER_VALUES,
  );

  readonly #countState = signal(this.#initialCounterValues?.initialCount ?? 0);
  readonly count = this.#countState.asReadonly();

  readonly #step = signal(this.#initialCounterValues?.step ?? 1);

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
