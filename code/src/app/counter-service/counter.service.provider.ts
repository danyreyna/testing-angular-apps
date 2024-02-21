import {
  CounterService,
  INITIAL_COUNTER_VALUES,
  type InitialCounterValues,
} from "./counter.service";

export function provideCounter(
  initialCounterValues: InitialCounterValues = {},
) {
  return [
    {
      provide: CounterService,
      deps: [INITIAL_COUNTER_VALUES],
    },
    {
      provide: INITIAL_COUNTER_VALUES,
      useValue: initialCounterValues,
    },
  ];
}
