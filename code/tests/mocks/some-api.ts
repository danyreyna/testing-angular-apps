import { http, type HttpHandler, HttpResponse } from "msw";
import { PathParams } from "msw";

const { json } = HttpResponse;

type LoginResponse = { username: string } | { message: string };

export const handlers: Array<HttpHandler> = [
  http.post<PathParams, { username: string; password: string }, LoginResponse>(
    "https://auth-provider.example.com/api/login",
    async ({ request }) => {
      const body = await request.json();

      if (!body.password) {
        return json(
          {
            message: "password required",
          },
          { status: 400 },
        );
      }

      if (!body.username) {
        return json(
          {
            message: "username required",
          },
          { status: 400 },
        );
      }

      return json({
        username: body.username,
      });
    },
  ),
];
