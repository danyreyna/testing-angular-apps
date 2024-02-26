import { type DefaultBodyType, HttpResponse } from "msw";
import type { RequiredPropertiesProblemDetail } from "../../../src/app/common/rfc-9457-problem-detail";

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
  const isPrimitive =
    typeof body === "string" ||
    typeof body === "number" ||
    typeof body === "boolean";

  const isNullable = body === null || body === undefined;

  if (isPrimitive || isNullable) {
    return null;
  }

  const { status, getProblemDetailError, headers } = errorResponse;

  const missingProperties = requiredProperties.filter(
    (propertyName) => body[propertyName] === undefined,
  );

  if (missingProperties.length === 0) {
    return null;
  }

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
