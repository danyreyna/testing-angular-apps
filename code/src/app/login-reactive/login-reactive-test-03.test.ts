import { faker } from "@faker-js/faker";
import { build, perBuild } from "@jackfranklin/test-data-bot";
import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import {
  type LoginFormValues,
  LoginReactiveComponent,
} from "./login-reactive.component";

const buildLoginForm = build<LoginFormValues>({
  fields: {
    username: perBuild(() => faker.internet.userName()),
    password: perBuild(() => faker.internet.password()),
  },
});

test("submitting the form calls onSubmit with username and password", async () => {
  await render(LoginReactiveComponent);
  const { username, password } = buildLoginForm();

  await userEvent.type(screen.getByLabelText(/username/i), username);
  await userEvent.type(screen.getByLabelText(/password/i), password);
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  const message = screen.getByText(/welcome, /i);
  expect(message).toHaveTextContent(`Welcome, ${username}!`);
});
