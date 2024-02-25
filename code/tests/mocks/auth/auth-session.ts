import { faker } from "@faker-js/faker";
import { addAuthSession } from "./auth-session-db";

export const AUTH_SESSION_ROLLING_DURATION = 600;
export const AUTH_SESSION_ABSOLUTE_DURATION = 604_800;

export const AUTH_SESSION_COOKIE_NAME = "__Host-id";

export function generateAuthSessionId() {
  /*
   * In a real backend, use a cryptographically secure random number generator.
   * This token would be an ID pointing to the client's information stored in the database.
   * The client's information is an identifier, meaningless to prevent information disclosure attacks.
   * It must never include sensitive information or Personally Identifiable Information.
   */
  return faker.string.uuid();
}

export function createAuthSession(authSessionId: string, userId: string) {
  const rollingExpiration = new Date();
  rollingExpiration.setSeconds(
    rollingExpiration.getSeconds() + AUTH_SESSION_ROLLING_DURATION,
  );

  const absoluteExpiration = new Date();
  absoluteExpiration.setSeconds(
    absoluteExpiration.getSeconds() + AUTH_SESSION_ABSOLUTE_DURATION,
  );

  return addAuthSession({
    id: authSessionId,
    rollingExpiration,
    absoluteExpiration,
    userId,
  });
}
