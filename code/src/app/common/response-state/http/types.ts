import { HttpResponse } from "@angular/common/http";
import type { JsonTypes } from "../../http/json-types";

type HttpPathParams = Record<string, string>;
type HttpQueryParams = Record<string, string | string[]>;

export type UrlParams = {
  pathParams?: HttpPathParams;
  queryParams?: HttpQueryParams;
};

export type RequestHeaders = Record<string, string | string[]>;

export type HttpResponseWithNonNullBody<TResponseBody extends JsonTypes> =
  HttpResponse<TResponseBody> & {
    body: NonNullable<HttpResponse<TResponseBody>["body"]>;
  };
