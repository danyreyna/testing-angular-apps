import type { HttpResponse } from "@angular/common/http";

export type HttpRes<T> = HttpResponse<T> & {
  body: NonNullable<HttpResponse<T>["body"]>;
};

export function isHttpRes<T>(
  httpResponse: HttpResponse<T>,
): httpResponse is HttpRes<T> {
  return httpResponse.body !== null;
}
