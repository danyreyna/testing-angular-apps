import type { HttpResponse } from "@angular/common/http";

export type HttpRes<T> = HttpResponse<T> & { readonly body: T };

export function isHttpRes<T>(
  httpResponse: HttpResponse<T>,
): httpResponse is HttpRes<T> {
  return httpResponse.body !== null;
}
