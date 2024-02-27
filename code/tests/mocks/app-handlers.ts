import { delay, http, HttpResponse, type PathParams } from "msw";
import type { BootstrapResponse } from "../../src/app/common/bootstrap.service";
import {
  fetchResponse,
  parseResponseBody,
} from "../../src/app/common/fetch-utils";
import { objectToFormData } from "../../src/app/common/object-to-form-data";
import { type Rfc9457ProblemDetail } from "../../src/app/common/rfc-9457-problem-detail";
import type { UserWithoutPassword } from "../../src/app/common/user";
import type { ChangeDetectionPerfRecord } from "../../src/profiler";
import { AUTH_SESSION_COOKIE_NAME } from "./auth/auth-session";
import { getAuthSession } from "./auth/auth-session-db";
import {
  buildClientCredentialsFlowRequest,
  type ClientCredentialsFlowResponse,
} from "./auth/client-credentials-flow";
import { mockBookDbTable } from "./book-handlers";
import { CORS_HEADERS } from "./common/cors-headers";
import { handleInternalServerError } from "./common/handle-internal-server-error";
import { getListItemsByOwner } from "./list-item-handlers";
import { getUser } from "./user/user-db";

export const handlers = [
  // endpoint to get the user's information and preload data in the in-memory cache
  http.get<PathParams>(
    "https://api.example.com/bootstrap",
    async ({ cookies }) => {
      await delay();

      const authSessionId = cookies[AUTH_SESSION_COOKIE_NAME];
      if (authSessionId === undefined) {
        const status = 401;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "A token must be provided",
            detail: "Can't bootstrap the application without a token",
          },
          {
            status,
            headers: CORS_HEADERS,
          },
        );
      }

      const authSessionResult = await getAuthSession(authSessionId);
      if (authSessionResult instanceof Error) {
        return handleInternalServerError(authSessionResult, CORS_HEADERS);
      }

      if (authSessionResult === undefined) {
        const status = 401;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "Invalid token. Please login again.",
            detail: "Can't bootstrap the application without a valid token",
          },
          {
            status,
            headers: CORS_HEADERS,
          },
        );
      }

      const userResult = await getUser(authSessionResult.userId);
      if (userResult instanceof Error) {
        return handleInternalServerError(userResult, CORS_HEADERS);
      }

      if (userResult === undefined) {
        const status = 404;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "User not found",
            detail: "Can't find an user with the provided token",
          },
          {
            status,
            headers: CORS_HEADERS,
          },
        );
      }

      const { id, username, source } = userResult;

      const userWithoutPassword: UserWithoutPassword = {
        id,
        username,
        source,
      };

      const listItems = getListItemsByOwner(userWithoutPassword.id);
      const listItemsAndBooks = listItems.map((listItem) => ({
        ...listItem,
        book: mockBookDbTable.get(listItem.bookId) ?? null,
      }));

      return HttpResponse.json<BootstrapResponse>(
        {
          user: userWithoutPassword,
          listItems: listItemsAndBooks,
        },
        {
          headers: CORS_HEADERS,
        },
      );
    },
  ),
  http.post<PathParams, ChangeDetectionPerfRecord>(
    "https://api.example.com/profiler",
    async ({ cookies, request }) => {
      const authSessionId = cookies[AUTH_SESSION_COOKIE_NAME];
      if (authSessionId === undefined) {
        const status = 401;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "A token must be provided",
            detail: "Can't profile the application without a token",
          },
          {
            status,
            headers: CORS_HEADERS,
          },
        );
      }

      /*
       * In a real backend the `client_id` and `client_secret`
       * would be stored in a secrets manager.
       */
      const clientCredentialsFlowRequest = buildClientCredentialsFlowRequest();

      const monitoringServiceTokenResponse = await fetchResponse(() =>
        fetch("https://some-monitoring-service.com/oauth/token", {
          method: "post",
          body: objectToFormData(clientCredentialsFlowRequest),
        }),
      );
      if (monitoringServiceTokenResponse instanceof Error) {
        return handleInternalServerError(
          monitoringServiceTokenResponse,
          CORS_HEADERS,
        );
      }
      if (!monitoringServiceTokenResponse.ok) {
        return handleInternalServerError(
          new Error(
            `The monitoring service token response has status "${monitoringServiceTokenResponse.status}"`,
          ),
          CORS_HEADERS,
        );
      }
      const clientCredentialsFlowResponse =
        await parseResponseBody<ClientCredentialsFlowResponse>(
          monitoringServiceTokenResponse,
        );
      if (clientCredentialsFlowResponse instanceof Error) {
        return handleInternalServerError(
          clientCredentialsFlowResponse,
          CORS_HEADERS,
        );
      }

      const changeDetectionPerfRecord = await request.json();

      const performanceMetricsResponse = await fetchResponse(() =>
        fetch("https://some-monitoring-service.com/metrics", {
          method: "post",
          headers: {
            Authorization: `Bearer ${clientCredentialsFlowResponse.access_token}`,
          },
          body: JSON.stringify(changeDetectionPerfRecord),
        }),
      );
      if (performanceMetricsResponse instanceof Error) {
        return handleInternalServerError(
          performanceMetricsResponse,
          CORS_HEADERS,
        );
      }
      if (!performanceMetricsResponse.ok) {
        return handleInternalServerError(
          new Error(
            `The monitoring service metrics response has status "${performanceMetricsResponse.status}"`,
          ),
          CORS_HEADERS,
        );
      }

      return new HttpResponse(null, { status: 204 });
    },
  ),
];
