import {
  CounterService,
  INITIAL_COUNTER_VALUES,
  type InitialCounterValues,
} from "./counter.service";

function counterServiceFactory(initialCounterValues: InitialCounterValues) {
  return new CounterService(initialCounterValues);
}

export function provideCounter(
  initialCounterValues: InitialCounterValues = {},
) {
  return [
    {
      provide: CounterService,
      useFactory: counterServiceFactory,
      deps: [INITIAL_COUNTER_VALUES],
    },
    {
      provide: INITIAL_COUNTER_VALUES,
      useValue: initialCounterValues,
    },
  ];
}
