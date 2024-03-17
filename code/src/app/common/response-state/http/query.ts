import {
  HttpClient,
  type HttpContext,
  type HttpResponse,
} from "@angular/common/http";
import { inject } from "@angular/core";
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
  type HandledObservableError,
  handleObservableError,
} from "../../error/handle-observable-error";
import type { JSONTypes } from "../../http/json-types";
import {
  type HttpQuery,
  type HttpQueryContext,
  type HttpQueryErrorState,
} from "./query-state";
import type {
  HttpResponseWithNonNullBody,
  RequestHeaders,
  UrlParams,
} from "./types";

type AngularHttpOptions = {
  context?: HttpContext;
  reportProgress?: boolean;
  responseType?: "json";
  withCredentials?: boolean;
  transferCache?:
    | {
        includeHeaders?: string[];
      }
    | boolean;
};

type QueryFnOptions<TRequestHeaders extends RequestHeaders> = {
  headers?: TRequestHeaders;
} & AngularHttpOptions;

export function httpGet<
  TResponseBody extends JSONTypes,
  TRequestHeaders extends RequestHeaders = RequestHeaders,
>(url: string, options?: QueryFnOptions<TRequestHeaders>) {
  const http = inject(HttpClient);

  return http.get<TResponseBody>(url, {
    ...options,
    observe: "response",
  });
}

export function httpHead<
  TRequestHeaders extends RequestHeaders = RequestHeaders,
>(url: string, options?: QueryFnOptions<TRequestHeaders>) {
  const http = inject(HttpClient);

  return http.head<null>(url, {
    ...options,
    observe: "response",
  });
}

type HttpQueryOptions<
  TResponseBody extends JSONTypes,
  TUrlParams extends UrlParams,
  THeaders extends RequestHeaders,
> = {
  queryFn: (
    context: HttpQueryContext<TUrlParams, THeaders>,
  ) => Observable<HttpResponse<TResponseBody>>;
  shouldUseCache?: boolean;
  urlParams?: TUrlParams;
  headers?: THeaders;
};

type ReturnTypeGetHttpQuery<
  TResponseBody extends JSONTypes,
  TUrlParams extends UrlParams,
  THeaders extends RequestHeaders,
> = {
  invalidateCache: () => void;
  observable$: Observable<HttpQuery<TResponseBody, TUrlParams, THeaders>>;
};

export function getHttpQuery<
  TResponseBody extends JSONTypes,
  TUrlParams extends UrlParams,
  THeaders extends RequestHeaders,
>(
  options: HttpQueryOptions<TResponseBody, TUrlParams, THeaders>,
): ReturnTypeGetHttpQuery<TResponseBody, TUrlParams, THeaders> {
  const { queryFn, urlParams, headers, shouldUseCache = false } = options;
  const resetCacheSubject = new BehaviorSubject<null>(null);

  const context = {
    urlParams: urlParams ?? ({} as TUrlParams),
    headers: headers ?? ({} as THeaders),
  };

  const httpRequest$ = queryFn(context);

  const mapHttpResponse = map<
    HttpResponse<TResponseBody>,
    HttpQuery<TResponseBody, TUrlParams, THeaders>
  >((httpResponse) => {
    return {
      state: "success",
      response: httpResponse as HttpResponseWithNonNullBody<TResponseBody>,
      context,
    };
  });

  const handleAndRethrowError = catchError<
    HttpQuery<TResponseBody, TUrlParams, THeaders>,
    ReturnType<typeof handleObservableError>
  >((errorResponse) => handleObservableError(errorResponse));

  const request$ = shouldUseCache
    ? resetCacheSubject.pipe(
        mergeMap<
          null,
          Observable<HttpQuery<TResponseBody, TUrlParams, THeaders>>
        >(() =>
          httpRequest$.pipe(
            shareReplay<HttpResponse<TResponseBody>>(1),
            mapHttpResponse,
            handleAndRethrowError,
          ),
        ),
      )
    : httpRequest$.pipe(mapHttpResponse, handleAndRethrowError);

  const observable$ = request$.pipe(
    startWith<HttpQuery<TResponseBody, TUrlParams, THeaders>>({
      state: "pending",
    }),
    catchError<
      HttpQuery<TResponseBody, TUrlParams, THeaders>,
      Observable<HttpQueryErrorState<TUrlParams, THeaders>>
    >((error: HandledObservableError) =>
      of<HttpQueryErrorState<TUrlParams, THeaders>>({
        state: "error",
        error,
        context,
      }),
    ),
  );

  function invalidateCache() {
    resetCacheSubject.next(null);
  }

  return {
    invalidateCache,
    observable$,
  };
}
