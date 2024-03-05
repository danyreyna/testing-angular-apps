import {
  HttpClient,
  type HttpContext,
  type HttpHeaders,
  type HttpParams,
  type HttpResponse,
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
  type HandledObservableError,
  handleObservableError,
} from "../../error/handle-observable-error";
import type { JSONTypes } from "../../json-types";
import {
  type HttpErrorState,
  type HttpPendingState,
  type HttpResponseWithNonNullBody,
  type HttpSuccessState,
} from "./state";
import type { GroupedUrlParams, HttpUrl, HttpUrlArgument } from "./url";

export type HttpQuery<TResponseBody extends JSONTypes> =
  | HttpPendingState
  | HttpErrorState
  | HttpSuccessState<TResponseBody>;

type HttpClientOptions = {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  context?: HttpContext;
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

type GetParams = {
  method: "get";
  shouldUseCache?: boolean;
  options?: HttpClientOptions;
};
type HeadParams = {
  method: "head";
  shouldUseCache?: boolean;
  options?: HttpClientOptions;
};

type HttpQueryParams = GetParams | HeadParams;

function getRequestObservable<TResponse extends JSONTypes>(
  url: string,
  params: HttpQueryParams,
) {
  const http = inject(HttpClient);

  const { method, options } = params;

  switch (method) {
    case "get":
      return http.get<TResponse>(url, { ...options, observe: "response" });
    case "head":
      return http.head<TResponse>(url, { ...options, observe: "response" });
    default: {
      const exhaustiveCheck: never = method;
      return exhaustiveCheck;
    }
  }
}

type ReturnTypeGetHttpQuery<
  TResponse extends JSONTypes,
  TUrlParams extends GroupedUrlParams,
> = {
  url: Signal<HttpUrl<TUrlParams>>;
  resetCache: () => void;
  observable$: Observable<HttpQuery<TResponse>>;
};

export function getHttpQuery<
  TResponseBody extends JSONTypes = null,
  TUrlParams extends GroupedUrlParams = GroupedUrlParams,
>(
  url: URL["href"] | (() => HttpUrlArgument<TUrlParams>),
  httpQueryParams: HttpQueryParams,
): ReturnTypeGetHttpQuery<TResponseBody, TUrlParams> {
  const { shouldUseCache = false } = httpQueryParams;
  const resetCacheSubject = new BehaviorSubject<null>(null);

  const urlState = signal<HttpUrlArgument<TUrlParams>>(
    typeof url === "string" ? { href: url } : url(),
  );
  const urlSignal = computed<HttpUrl<TUrlParams>>(() => {
    const { href, pathParams, queryParams } = urlState();

    return {
      href,
      pathParams: pathParams ?? {},
      queryParams: queryParams ?? {},
    };
  });

  const httpRequest$ = getRequestObservable<TResponseBody>(
    urlSignal().href,
    httpQueryParams,
  );

  const mapHttpResponse = map<
    HttpResponse<TResponseBody>,
    HttpQuery<TResponseBody>
  >((httpResponse) => {
    return {
      state: "success",
      response: httpResponse as HttpResponseWithNonNullBody<TResponseBody>,
    };
  });

  const handleAndRethrowError = catchError<
    HttpQuery<TResponseBody>,
    ReturnType<typeof handleObservableError>
  >((errorResponse) => handleObservableError(errorResponse));

  const request$ = shouldUseCache
    ? resetCacheSubject.pipe(
        mergeMap<null, Observable<HttpQuery<TResponseBody>>>(() =>
          httpRequest$.pipe(
            shareReplay<HttpResponse<TResponseBody>>(1),
            mapHttpResponse,
            handleAndRethrowError,
          ),
        ),
      )
    : httpRequest$.pipe(mapHttpResponse, handleAndRethrowError);

  const observable$ = request$.pipe(
    startWith<HttpQuery<TResponseBody>>({ state: "pending" }),
    catchError<HttpQuery<TResponseBody>, Observable<HttpErrorState>>(
      (error: HandledObservableError) =>
        of<HttpErrorState>({ state: "error", error }),
    ),
  );

  function resetCache() {
    resetCacheSubject.next(null);
  }

  return {
    url: urlSignal,
    resetCache,
    observable$,
  };
}
