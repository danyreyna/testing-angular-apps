import { expect, test } from "vitest";
import { render, screen } from "../../../tests/utils";
import { SomeButtonComponent } from "./some-button.component";

test("renders with the light styles for the light theme", async () => {
  const { rerender } = await render(SomeButtonComponent, {
    componentProperties: { label: "Click me" },
  });

  const button = screen.getByRole("button", { name: /click me/i });

  expect(button).toHaveTextContent("Click me");
  expect(button).toHaveStyle(`
    background-color: rgb(255, 255, 255);
    color: rgb(0, 0, 0);
  `);

  await rerender({
    componentProperties: { label: "Label changed" },
  });

  expect(button).toHaveTextContent("Label changed");
  expect(button).toHaveStyle(`
    background-color: rgb(255, 255, 255);
    color: rgb(0, 0, 0);
  `);
});

test("renders with the dark styles for the dark theme", async () => {
  await render(SomeButtonComponent, {
    theme: "dark",
    componentProperties: { label: "Click me" },
  });

  const button = screen.getByRole("button", { name: /click me/i });

  expect(button).toHaveStyle(`
    background-color: rgb(0, 0, 0);
    color: rgb(255, 255, 255);
  `);
});
