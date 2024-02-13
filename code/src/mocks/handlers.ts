import { http, HttpResponse, type PathParams } from "msw";
import type { LoginFormValues } from "../app/login-submission/login-submission-form.component";

export const handlers = [
  http.post<PathParams, LoginFormValues>(
    "https://auth-provider.example.com/api/login",
    async ({ request }) => {
      const body = await request.json();
      const { username } = body;

      return HttpResponse.json({ username });
    },
  ),
];
