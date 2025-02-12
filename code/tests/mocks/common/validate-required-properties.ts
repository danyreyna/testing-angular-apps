import { type DefaultBodyType, HttpResponse } from "msw";
import type { RequiredPropertiesProblemDetail } from "../../../src/app/common/http/rfc-9457-problem-detail";
import { isObjectLike } from "../../../src/app/common/is-object-like";
import { handleInternalServerError } from "./handle-internal-server-error";

export function validateRequiredProperties<
  TRequestBody extends DefaultBodyType = DefaultBodyType,
>(
  body: TRequestBody,
  requiredProperties: string[],
  errorResponse: {
    status: number;
    getProblemDetailError: (
      propertyName: string,
    ) => RequiredPropertiesProblemDetail["errors"][number];
    headers?: HeadersInit;
  },
) {
  const { headers } = errorResponse;

  if (!isObjectLike(body)) {
    return handleInternalServerError(
      new Error("The request body must be an object"),
      headers,
    );
  }

  const missingProperties = requiredProperties.filter(
    (propertyName) =>
      body[propertyName] === undefined || body[propertyName] === "",
  );

  if (missingProperties.length === 0) {
    return null;
  }

  const { status, getProblemDetailError } = errorResponse;

  return HttpResponse.json<RequiredPropertiesProblemDetail>(
    {
      status,
      title: "The request body is missing required properties",
      errors: missingProperties.map((propertyName) =>
        getProblemDetailError(propertyName),
      ),
    },
    {
      status,
      headers,
    },
  );
}
