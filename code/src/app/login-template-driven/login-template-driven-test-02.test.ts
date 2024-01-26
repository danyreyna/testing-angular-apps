import { faker } from "@faker-js/faker";
import { build, perBuild } from "@jackfranklin/test-data-bot";
import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import {
  type LoginFormValues,
  LoginTemplateDrivenComponent,
} from "./login-template-driven.component";

const buildLoginForm = build<LoginFormValues>({
  fields: {
    username: perBuild(() => faker.internet.userName()),
    password: perBuild(() => faker.internet.password()),
  },
});

test("submitting the form displays a welcome message", async () => {
  await render(LoginTemplateDrivenComponent);
  const { username, password } = buildLoginForm.one();

  await userEvent.type(screen.getByLabelText(/username/i), username);
  await userEvent.type(screen.getByLabelText(/password/i), password);
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  const message = screen.getByText(/welcome, /i);
  expect(message).toHaveTextContent(`Welcome, ${username}!`);
});
