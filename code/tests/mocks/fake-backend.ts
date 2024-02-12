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
  Pick<User, "username"> & { passwordHash: string }
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
  http.put<{ id: string }, Pick<User, "username" | "password">>(
    "https://api.example.com/user/:id",
    async ({ params, request }) => {
      const body = await request.json();

      const { username, password } = body;
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

      const passwordHash = getStringHash(password);

      const existingUser = fakeUsersDb.get(id);
      if (existingUser === undefined) {
        fakeUsersDb.set(id, { username, passwordHash });

        return new HttpResponse(null, { status: 201 });
      }

      const doesUserAlreadyHaveRequestedUpdates =
        username === existingUser.username &&
        passwordHash === existingUser.passwordHash;
      if (doesUserAlreadyHaveRequestedUpdates) {
        return new HttpResponse(null, { status: 200 });
      }

      fakeUsersDb.set(id, { username, passwordHash });
      return new HttpResponse(null, { status: 200 });
    },
  ),
];
