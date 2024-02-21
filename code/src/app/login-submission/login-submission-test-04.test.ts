import { provideHttpClient } from "@angular/common/http";
import { faker } from "@faker-js/faker";
import { build, perBuild } from "@jackfranklin/test-data-bot";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { expect, test } from "vitest";
import { server } from "../../../tests/mocks";
import { type LoginFormValues } from "./login-submission-form.component";
import { LoginSubmissionComponent } from "./login-submission.component";

const buildLoginForm = build<LoginFormValues>({
  fields: {
    username: perBuild(() => faker.internet.userName()),
    password: perBuild(() => faker.internet.password()),
  },
});

const { json } = HttpResponse;

test(`logging in displays the user's username`, async () => {
  await render(LoginSubmissionComponent, {
    providers: [provideHttpClient()],
  });
  const { username, password } = buildLoginForm.one();

  await userEvent.type(screen.getByLabelText(/username/i), username);
  await userEvent.type(screen.getByLabelText(/password/i), password);
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await waitForElementToBeRemoved(() => screen.queryByLabelText(/loading/i));

  expect(screen.getByText(username)).toBeInTheDocument();
});

test("omitting the password results in an error", async () => {
  await render(LoginSubmissionComponent, {
    providers: [provideHttpClient()],
  });
  const { username } = buildLoginForm.one();

  await userEvent.type(screen.getByLabelText(/username/i), username);
  // don't type in the password
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await waitForElementToBeRemoved(() => screen.queryByLabelText(/loading/i));

  expect(screen.getByRole("alert").textContent).toMatchInlineSnapshot(
    `" password required "`,
  );
});

test("unknown server error displays the error message", async () => {
  const testErrorMessage = "Oh no, something bad happened";
  server.use(
    http.post("https://auth-provider.example.com/api/login", async () => {
      return json({ message: testErrorMessage }, { status: 500 });
    }),
  );

  await render(LoginSubmissionComponent, {
    providers: [provideHttpClient()],
  });

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await waitForElementToBeRemoved(() => screen.queryByLabelText(/loading/i));

  expect(screen.getByRole("alert")).toHaveTextContent(testErrorMessage);
});
