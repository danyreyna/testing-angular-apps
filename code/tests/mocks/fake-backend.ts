import { http, HttpResponse } from "msw";
import type { User } from "../../src/app/common/user";

type Rfc9457ProblemDetail = {
  type?: string;
  status?: number;
  title?: string;
  detail?: string;
  instance?: string;
};

const fakeUsersDb = new Map<
  string,
  Pick<User, "username" | "source"> & { passwordHash: string }
>();

function getStringHash(str: string) {
  let hashNumber = 5381;
  let i = str.length;

  while (i) {
    hashNumber = (hashNumber * 33) ^ str.charCodeAt((i -= 1));
  }
  return String(hashNumber >>> 0);
}

export const handlers = [
  http.put<{ id: string }, Pick<User, "username" | "password" | "source">>(
    "https://api.example.com/user/:id",
    async ({ params, request }) => {
      const body = await request.json();

      const { username, password, source } = body;
      const { id } = params;

      if (!username) {
        const status = 400;
        const problemDetail: Rfc9457ProblemDetail = {
          status,
          title: "A username is required",
          detail:
            "To create or update a user a full representation including the username must be provided",
        };
        return HttpResponse.json(problemDetail, { status });
      }

      if (!password) {
        const status = 400;
        const problemDetail: Rfc9457ProblemDetail = {
          status,
          title: "A password is required",
          detail:
            "To create or update a user a full representation including the password must be provided",
        };
        return HttpResponse.json(problemDetail, { status });
      }

      if (!source) {
        const status = 400;
        const problemDetail: Rfc9457ProblemDetail = {
          status,
          title: "A source is required",
          detail:
            "To create or update a user a full representation including the source must be provided",
        };
        return HttpResponse.json(problemDetail, { status });
      }

      const passwordHash = getStringHash(password);

      const existingUser = fakeUsersDb.get(id);
      if (existingUser === undefined) {
        fakeUsersDb.set(id, { username, passwordHash, source });

        return new HttpResponse(null, { status: 201 });
      }

      const doesUserAlreadyHaveRequestedUpdates =
        username === existingUser.username &&
        passwordHash === existingUser.passwordHash &&
        source === existingUser.source;
      if (doesUserAlreadyHaveRequestedUpdates) {
        return new HttpResponse(null, { status: 200 });
      }

      fakeUsersDb.set(id, { username, passwordHash, source });
      return new HttpResponse(null, { status: 200 });
    },
  ),
  http.delete<{ id: string }>("https://api.example.com/user", ({ request }) => {
    const url = new URL(request.url);
    const source = url.searchParams.get("source");

    if (source !== "test") {
      const status = 400;
      const problemDetail: Rfc9457ProblemDetail = {
        status,
        title: `The source must be "test"`,
        detail:
          "At the moment we can only delete multiple users if they were generated in tests",
      };
      return HttpResponse.json(problemDetail, { status });
    }

    const userIdsToDelete = Array.from(fakeUsersDb.entries())
      .filter(([, { source: currentSource }]) => currentSource === source)
      .map(([id]) => id);

    for (const id of userIdsToDelete) {
      fakeUsersDb.delete(id);
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
