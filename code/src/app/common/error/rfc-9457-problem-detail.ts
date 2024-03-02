import { isObjectLike, type ObjectLike } from "../is-object-like";

export type Rfc9457ProblemDetail = {
  type?: string;
  status?: number;
  title?: string;
  detail?: string;
  instance?: string;
};

export function isRfc9457ProblemDetail(
  value: unknown,
): value is Rfc9457ProblemDetail {
  if (!isObjectLike(value)) {
    return false;
  }

  return (
    typeof value["type"] === "string" ||
    typeof value["status"] === "number" ||
    typeof value["title"] === "string" ||
    typeof value["detail"] === "string" ||
    typeof value["instance"] === "string"
  );
}

/*
 * Add an "errors" extension to the Problem Detail
 * https://www.rfc-editor.org/rfc/rfc9457.html#name-extension-members
 */
export type RequiredPropertiesProblemDetail = Rfc9457ProblemDetail & {
  errors: { title: string; detail: string }[];
};

function hasErrorsExtension(value: ObjectLike) {
  const errors = value["errors"];

  if (!Array.isArray(errors)) {
    return false;
  }

  return errors.every(
    (error) =>
      isObjectLike(error) &&
      typeof error["title"] === "string" &&
      typeof error["detail"] === "string",
  );
}

export function isRequiredPropertiesProblemDetail(
  value: unknown,
): value is RequiredPropertiesProblemDetail {
  return isRfc9457ProblemDetail(value) && hasErrorsExtension(value);
}
