import { faker } from "@faker-js/faker";
import { findByUsername } from "../user/user-db";
import type { AuthSession, DbUser } from "../common/mock-db";

const ROLLING_DURATION = 600;
const ABSOLUTE_DURATION = 604_800;

/*
 * In a real backend, use `__Host-id`.
 * See "Cookie prefixes" at https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
 */
export const AUTH_SESSION_COOKIE_NAME = "id";

/*
 * In a real backend, set "HttpOnly".
 * We're not setting it here because for security reasons,
 * browsers block frontend JavaScript code from including the `Set-Cookie` header
 * on manually constructed responses.
 * https://fetch.spec.whatwg.org/#forbidden-response-header-name
 * Since MSW runs on the client, to work around this limitation it sets the mocked cookie
 * directly on `document.cookie` and needs JavaScript access to it.
 * https://mswjs.io/docs/recipes/cookies/#mock-response-cookies
 */
/*
 * In a real backend, set "Secure".
 * We're not using it here because Chromium browsers can't load
 * the `mockServiceWorker.js` script when using `ng serve --ssl`.
 */
const COOKIE_PARAMS = ["SameSite=Strict", "Path=/"];
const MAX_AGE = `Max-Age=${ROLLING_DURATION}`;

/*
 * To remove a cookie, the server returns a Set-Cookie header
 * with an expiration date in the past.
 * The server will be successful in removing the cookie
 * only if the Path and the Domain attribute in the Set-Cookie header
 * match the values used when the cookie was created.
 * https://www.rfc-editor.org/rfc/rfc6265.html
 */
// const PAST_EXPIRES = "Expires=Sun, 06 Nov 1994 08:49:37 GMT";

/*
 * Although using `Expires` is the recommended way to remove a cookie,
 * MSW has a bug in the way it handles the comma in the HTTP-date format,
 * so we'll use `Max-Age` instead.
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#expiresdate
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Date
 * https://github.com/mswjs/msw/blob/b3e47f71d3a0333aaeab3da5839cb9068a30d7ef/src/core/utils/HttpResponse/decorators.ts#L46
 */
const EXPIRED_MAX_AGE = "Max-Age=0";

/*
 * In a real backend, the cookie would be signed and/or encrypted.
 */
export function buildAuthSessionCookie(sessionId: AuthSession["id"]) {
  return `${AUTH_SESSION_COOKIE_NAME}=${sessionId};${[...COOKIE_PARAMS, MAX_AGE].join(";")}`;
}

export function removeAuthSessionCookie() {
  return `${AUTH_SESSION_COOKIE_NAME}=;${[...COOKIE_PARAMS, EXPIRED_MAX_AGE].join(";")}`;
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

export function getAuthSessionExpirations() {
  const rollingExpiration = new Date();
  rollingExpiration.setSeconds(
    rollingExpiration.getSeconds() + ROLLING_DURATION,
  );

  const absoluteExpiration = new Date();
  absoluteExpiration.setSeconds(
    absoluteExpiration.getSeconds() + ABSOLUTE_DURATION,
  );

  return {
    rollingExpiration,
    absoluteExpiration,
  };
}

export function areCredentialsValid(
  user: Awaited<ReturnType<typeof findByUsername>>,
  passwordHash: string,
): { isValid: true; user: DbUser } | { isValid: false; user: null } {
  const isValid =
    !(user instanceof Error) &&
    user !== undefined &&
    user.passwordHash === passwordHash;

  if (isValid) {
    return {
      isValid,
      user,
    };
  }

  return {
    isValid,
    user: null,
  };
}
