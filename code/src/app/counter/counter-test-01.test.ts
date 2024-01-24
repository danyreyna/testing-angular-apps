import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { CounterComponent } from "./counter.component";

test("should increment the counter on click", async () => {
  await render(CounterComponent, { componentProperties: { initialCount: 3 } });

  const increment = screen.getByRole("button", { name: /increment/i });
  const decrement = screen.getByRole("button", { name: /decrement/i });
  const message = screen.getByText(/current count/i);

  expect(message).toHaveTextContent("Current count: 3");
  await userEvent.click(increment);
  expect(message).toHaveTextContent("Current count: 4");
  await userEvent.click(decrement);
  expect(message).toHaveTextContent("Current count: 3");
});
