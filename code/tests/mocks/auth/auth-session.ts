import { faker } from "@faker-js/faker";
import { addSession } from "./session-db";

export const SESSION_ROLLING_DURATION = 600;
export const SESSION_ABSOLUTE_DURATION = 604_800;

export const SESSION_COOKIE_NAME = "__Host-id";

export function generateSessionId() {
  /*
   * In a real backend, use a cryptographically secure random number generator.
   * This token would be an ID pointing to the client's information stored in the database.
   * The client's information is an identifier, meaningless to prevent information disclosure attacks.
   * It must never include sensitive information or Personally Identifiable Information.
   */
  return faker.string.uuid();
}

export function createSession(sessionId: string, userId: string) {
  const rollingExpiration = new Date();
  rollingExpiration.setSeconds(
    rollingExpiration.getSeconds() + SESSION_ROLLING_DURATION,
  );

  const absoluteExpiration = new Date();
  absoluteExpiration.setSeconds(
    absoluteExpiration.getSeconds() + SESSION_ABSOLUTE_DURATION,
  );

  return addSession({
    id: sessionId,
    rollingExpiration,
    absoluteExpiration,
    userId,
  });
}
