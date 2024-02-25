import { faker } from "@faker-js/faker";
import type { AuthSession } from "../common/mock-db";
import { addAuthSession } from "./auth-session-db";

const ROLLING_DURATION = 600;
const ABSOLUTE_DURATION = 604_800;

export const AUTH_SESSION_COOKIE_NAME = "__Host-id";

/*
 * In a real backend, also set HttpOnly.
 * We're not setting it here because for security reasons,
 * browsers block frontend JavaScript code from including the `Set-Cookie` header
 * on manually constructed responses.
 * https://fetch.spec.whatwg.org/#forbidden-response-header-name
 * Since MSW runs on the client, to work around this limitation it sets the mocked cookie
 * directly on `document.cookie` and needs JavaScript access to it.
 * https://mswjs.io/docs/recipes/cookies/#mock-response-cookies
 */
const COOKIE_PARAMS = ["Secure", "SameSite=Strict", "Path=/"];
const MAX_AGE = `Max-Age=${ROLLING_DURATION}`;

/*
 * To remove a cookie, the server returns a Set-Cookie header
 * with an expiration date in the past.
 * The server will be successful in removing the cookie
 * only if the Path and the Domain attribute in the Set-Cookie header
 * match the values used when the cookie was created.
 * https://www.rfc-editor.org/rfc/rfc6265.html
 */
const PAST_EXPIRES = "Sun, 06 Nov 1994 08:49:37 GMT";

export function buildAuthSessionCookie(sessionId: AuthSession["id"]) {
  return `${AUTH_SESSION_COOKIE_NAME}=${sessionId};${[...COOKIE_PARAMS, MAX_AGE].join(";")}`;
}

export function removeAuthSessionCookie() {
  return `${AUTH_SESSION_COOKIE_NAME}=;${[...COOKIE_PARAMS, PAST_EXPIRES].join(";")}`;
}

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
    rollingExpiration.getSeconds() + ROLLING_DURATION,
  );

  const absoluteExpiration = new Date();
  absoluteExpiration.setSeconds(
    absoluteExpiration.getSeconds() + ABSOLUTE_DURATION,
  );

  return addAuthSession({
    id: authSessionId,
    rollingExpiration,
    absoluteExpiration,
    userId,
  });
}
