import { expect, test } from "vitest";
import { renderService } from "../../../tests/utils";
import { CounterService } from "./counter.service";
import { provideCounter } from "./counter.service.provider";

test("exposes the count and increment/decrement functions", async () => {
  const { result } = await renderService(CounterService, [...provideCounter()]);

  expect(result.current.count()).toBe(0);

  result.current.increment();
  expect(result.current.count()).toBe(1);

  result.current.decrement();
  expect(result.current.count()).toBe(0);
});

test("allows customization of the initial count", async () => {
  const { result } = await renderService(CounterService, [
    ...provideCounter({ initialCount: 3 }),
  ]);

  expect(result.current.count()).toBe(3);
});

test("allows customization of the step", async () => {
  const { result } = await renderService(CounterService, [
    ...provideCounter({ step: 2 }),
  ]);

  expect(result.current.count()).toBe(0);

  result.current.increment();
  expect(result.current.count()).toBe(2);

  result.current.decrement();
  expect(result.current.count()).toBe(0);
});

test("the step can be changed", async () => {
  const { result } = await renderService(CounterService, [
    ...provideCounter({ step: 3 }),
  ]);

  expect(result.current.count()).toBe(0);

  result.current.increment();
  expect(result.current.count()).toBe(3);

  result.current.setStep(2);

  result.current.decrement();
  expect(result.current.count()).toBe(1);
});
