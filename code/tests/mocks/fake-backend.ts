import { faker } from "@faker-js/faker";
import { http, HttpResponse, type PathParams } from "msw";
import type { User } from "../../src/app/common/user";
import { getStringHash } from "./get-string-hash";

type Rfc9457ProblemDetail = {
  type?: string;
  status?: number;
  title?: string;
  detail?: string;
  instance?: string;
};

const mockUserDbTable = new Map<
  string,
  Pick<User, "username" | "source"> & { passwordHash: string }
>();

const mockSessionDbTable = new Map<
  string,
  {
    rollingExpiration: Date;
    absoluteExpiration: Date;
    userId: User["id"];
  }
>();

const SESSION_ROLLING_DURATION = 600;
const SESSION_ABSOLUTE_DURATION = 604_800;

export type UserWithoutPassword = Pick<User, "id" | "username" | "source">;

export const handlers = [
  http.put<{ id: string }, Pick<User, "username" | "password" | "source">>(
    "https://api.example.com/user/:id",
    async ({ params, request }) => {
      const body = await request.json();

      const { username, password, source } = body;
      const { id } = params;

      if (!username) {
        const status = 400;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "A username is required",
            detail:
              "To create or update a user a full representation including the username must be provided",
          },
          { status },
        );
      }

      if (!password) {
        const status = 400;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "A password is required",
            detail:
              "To create or update a user a full representation including the password must be provided",
          },
          { status },
        );
      }

      if (!source) {
        const status = 400;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "A source is required",
            detail:
              "To create or update a user a full representation including the source must be provided",
          },
          { status },
        );
      }

      const passwordHash = getStringHash(password);

      const existingUser = mockUserDbTable.get(id);
      if (existingUser === undefined) {
        mockUserDbTable.set(id, { username, passwordHash, source });

        return new HttpResponse(null, { status: 201 });
      }

      const doesUserAlreadyHaveRequestedUpdates =
        username === existingUser.username &&
        passwordHash === existingUser.passwordHash &&
        source === existingUser.source;
      if (doesUserAlreadyHaveRequestedUpdates) {
        return new HttpResponse(null, { status: 200 });
      }

      mockUserDbTable.set(id, { username, passwordHash, source });
      return new HttpResponse(null, { status: 200 });
    },
  ),
  http.delete<{ id: string }>("https://api.example.com/user", ({ request }) => {
    const url = new URL(request.url);
    const source = url.searchParams.get("source");

    if (source !== "test") {
      const status = 400;
      return HttpResponse.json<Rfc9457ProblemDetail>(
        {
          status,
          title: `The source must be "test"`,
          detail:
            "At the moment we can only delete multiple users if they were generated in tests",
        },
        { status },
      );
    }

    const userIdsToDelete = Array.from(mockUserDbTable.entries())
      .filter(([, { source: currentSource }]) => currentSource === source)
      .map(([id]) => id);

    for (const id of userIdsToDelete) {
      mockUserDbTable.delete(id);
    }

    return new HttpResponse(null, { status: 204 });
  }),
  http.post<PathParams, Pick<User, "username" | "password">>(
    "https://api.example.com/login",
    async ({ request }) => {
      const body = await request.json();
      const { username, password } = body;

      if (!username) {
        const status = 400;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "Username is required",
          },
          { status },
        );
      }

      if (!password) {
        const status = 400;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "Password is required",
          },
          { status },
        );
      }

      const userEntry = Array.from(mockUserDbTable.entries()).find(
        ([, { username: currentUsername }]) => currentUsername === username,
      );
      if (
        userEntry === undefined ||
        userEntry[1].passwordHash !== getStringHash(password)
      ) {
        const status = 400;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "Invalid username or password",
          },
          { status },
        );
      }

      const [id, user] = userEntry;

      /*
       * In a real backend, use a cryptographically secure random number generator.
       * This token would be an ID pointing to the client's information stored in the database.
       * The client's information is an identifier, meaningless to prevent information disclosure attacks.
       * It must never include sensitive information or Personally Identifiable Information.
       */
      const token = faker.string.uuid();

      const rollingExpiration = new Date();
      rollingExpiration.setSeconds(
        rollingExpiration.getSeconds() + SESSION_ROLLING_DURATION,
      );

      const absoluteExpiration = new Date();
      absoluteExpiration.setSeconds(
        absoluteExpiration.getSeconds() + SESSION_ABSOLUTE_DURATION,
      );

      mockSessionDbTable.set(token, {
        rollingExpiration,
        absoluteExpiration,
        userId: id,
      });

      return HttpResponse.json<UserWithoutPassword>(
        {
          id,
          username: user.username,
          source: user.source,
        },
        {
          status: 200,
          headers: {
            "Set-Cookie": `__Host-id=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_ROLLING_DURATION}`,
          },
        },
      );
    },
  ),
  http.post("https://api.example.com/logout", ({ cookies }) => {
    const sessionId = cookies["__Host-id"];
    if (sessionId === undefined) {
      const status = 401;
      return HttpResponse.json<Rfc9457ProblemDetail>(
        {
          status,
          title: "Can't log out a session that doesn't exist",
        },
        { status },
      );
    }

    mockSessionDbTable.delete(sessionId);

    return new HttpResponse(null, {
      status: 204,
      headers: { "Set-Cookie": `__Host-id=` },
    });
  }),
];
