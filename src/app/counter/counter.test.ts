import { fireEvent, render, screen } from "@testing-library/angular";
import { expect, test } from "vitest";
import { CounterComponent } from "./counter.component";

test("should render counter", async () => {
  await render(CounterComponent);

  expect(screen.getByText("Current count: 0")).toBeInTheDocument();
});

test("should increment the counter on click", async () => {
  await render(CounterComponent);

  fireEvent.click(screen.getByText("Increment"));

  expect(screen.getByText("Current count: 1")).toBeInTheDocument();
});
