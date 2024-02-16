import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from "@angular/common/http";
import { computed, inject, type Signal, signal } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  map,
  mergeMap,
  type Observable,
  of,
  shareReplay,
  startWith,
} from "rxjs";
import {
  type HandledHttpError,
  handleObservableError,
} from "../handle-observable-error";
import type { JSONTypes } from "../json-types";
import type { HttpUrl, HttpUrlParams, InputHttpUrl } from "./http-url-params";
import type { QueryWithState } from "./query-with-state";
import type { HttpErrorResponse, SuccessResponse } from "./response-states";

type HttpClientOptions = {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  context?: HttpContext;
  observe?: "body";
  params?:
    | HttpParams
    | {
        [param: string]:
          | string
          | number
          | boolean
          | ReadonlyArray<string | number | boolean>;
      };
  reportProgress?: boolean;
  responseType?: "json";
  withCredentials?: boolean;
  transferCache?:
    | {
        includeHeaders?: string[];
      }
    | boolean;
};
export type GetParams = {
  method: "get";
  options?: HttpClientOptions;
};

export type HeadParams = {
  method: "head";
  options?: HttpClientOptions;
};

export type HttpQueryParams = GetParams | HeadParams;

function getRequestObservable<TResponse extends JSONTypes>(
  url: string,
  httpParams: HttpQueryParams,
) {
  const http = inject(HttpClient);

  const { method, options } = httpParams;

  switch (method) {
    case "get":
      return http.get<TResponse>(url, options);
    case "head":
      return http.head<TResponse>(url, options);
    default: {
      const exhaustiveCheck: never = method;
      return exhaustiveCheck;
    }
  }
}

export type GetHttpQueryResult<
  TResponse extends JSONTypes = null,
  TUrlParams extends HttpUrlParams = HttpUrlParams,
> = {
  url: Signal<HttpUrl<TUrlParams>>;
  resetCacheSubject: BehaviorSubject<null>;
  request: Observable<QueryWithState<TResponse>>;
};

export function getHttpQuery<
  TResponse extends JSONTypes = null,
  TUrlParams extends HttpUrlParams = HttpUrlParams,
>(
  url:
    | URL["href"]
    | (() => InputHttpUrl<
        NonNullable<TUrlParams["pathParams"]>,
        NonNullable<TUrlParams["queryParams"]>
      >),
  httpQueryParams: HttpQueryParams,
): GetHttpQueryResult<TResponse, TUrlParams> {
  type TResponseWithState = QueryWithState<TResponse>;
  type TSuccessResponse = SuccessResponse<TResponse>;

  const resetCacheSubject = new BehaviorSubject<null>(null);

  const urlState = signal<
    InputHttpUrl<
      NonNullable<TUrlParams["pathParams"]>,
      NonNullable<TUrlParams["queryParams"]>
    >
  >({
    href: "",
  });
  const urlSignal = computed(() => {
    const { href, pathParams, queryParams } = urlState();

    return {
      href,
      pathParams: pathParams ?? ({} as TUrlParams["pathParams"]),
      queryParams: queryParams ?? ({} as TUrlParams["queryParams"]),
    } as HttpUrl<TUrlParams>;
  });

  if (typeof url === "string") {
    urlState.set({ href: url });
  } else {
    urlState.set(url());
  }

  const httpRequest$ = resetCacheSubject.pipe(
    mergeMap(() =>
      getRequestObservable<TResponse>(urlSignal().href, httpQueryParams).pipe(
        map<TResponse, TSuccessResponse>((response) => ({
          state: "success",
          data: response,
        })),
        shareReplay(1),
        catchError((errorResponse) => handleObservableError(errorResponse)),
      ),
    ),
  );

  const request = httpRequest$.pipe(
    startWith<TResponseWithState>({ state: "pending" }),
    catchError((error: HandledHttpError) =>
      of<HttpErrorResponse>({
        state: "error",
        message: error.message,
        status: error.status,
      }),
    ),
  );

  return {
    url: urlSignal,
    resetCacheSubject,
    request,
  };
}
