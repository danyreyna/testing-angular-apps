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
  type Observable,
  of,
  startWith,
  switchMap,
} from "rxjs";
import {
  type HandledObservableError,
  handleObservableError,
} from "../../error/handle-observable-error";
import type { JSONTypes } from "../../json-types";
import {
  type HttpErrorState,
  type HttpIdleState,
  type HttpPendingState,
  type HttpResponseWithNonNullBody,
  type HttpSuccessState,
} from "./state";
import type { GroupedUrlParams, HttpUrl, HttpUrlArgument } from "./url";

export type HttpCommand<TResponseBody extends JSONTypes> =
  | HttpIdleState
  | HttpPendingState
  | HttpErrorState
  | HttpSuccessState<TResponseBody>;

export type DeleteParams = {
  method: "delete";
  options?: {
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
  };
};

export type PatchParams = {
  method: "patch";
  shouldSendBodyFromSubject?: boolean;
  options?: {
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
  };
};

export type PostParams = {
  method: "post";
  shouldSendBodyFromSubject?: boolean;
  options?: {
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
};

export type PutParams = {
  method: "put";
  shouldSendBodyFromSubject?: boolean;
  options?: {
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
  };
};

export type HttpCommandParams =
  | DeleteParams
  | PatchParams
  | PostParams
  | PutParams;

function getRequestObservable<
  TResponseBody extends JSONTypes,
  TSubjectValue extends JSONTypes,
>(url: string, httpParams: HttpCommandParams) {
  const http = inject(HttpClient);

  const { method } = httpParams;

  return (subjectValue: TSubjectValue) => {
    switch (method) {
      case "delete": {
        const { options } = httpParams;
        return http.delete<TResponseBody>(url, {
          ...options,
          observe: "response",
        });
      }
      case "patch": {
        const { shouldSendBodyFromSubject = true, options } = httpParams;

        return http.patch<TResponseBody>(
          url,
          shouldSendBodyFromSubject ? subjectValue : null,
          { ...options, observe: "response" },
        );
      }
      case "post": {
        const { shouldSendBodyFromSubject = true, options } = httpParams;

        return http.post<TResponseBody>(
          url,
          shouldSendBodyFromSubject ? subjectValue : null,
          { ...options, observe: "response" },
        );
      }
      case "put": {
        const { shouldSendBodyFromSubject = true, options } = httpParams;

        return http.put<TResponseBody>(
          url,
          shouldSendBodyFromSubject ? subjectValue : null,
          { ...options, observe: "response" },
        );
      }
      default: {
        const exhaustiveCheck: never = method;
        return exhaustiveCheck;
      }
    }
  };
}

export type ReturnTypeGetHttpCommand<
  TResponseBody extends JSONTypes,
  TSubjectValue extends JSONTypes,
  TUrlParams extends GroupedUrlParams,
> = {
  url: Signal<HttpUrl<TUrlParams>>;
  subject: BehaviorSubject<null | TSubjectValue>;
  observable$: Observable<HttpCommand<TResponseBody>>;
};

export function getHttpCommand<
  TResponseBody extends JSONTypes = null,
  TSubjectValue extends JSONTypes = null,
  TUrlParams extends GroupedUrlParams = GroupedUrlParams,
>(
  url: URL["href"] | (() => HttpUrlArgument<TUrlParams>),
  httpCommandParams: HttpCommandParams,
): ReturnTypeGetHttpCommand<TResponseBody, TSubjectValue, TUrlParams> {
  const subject = new BehaviorSubject<null | TSubjectValue>(null);
  const action$ = subject.asObservable();

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

  const getRequestObservablePartial = getRequestObservable<
    TResponseBody,
    TSubjectValue
  >(urlSignal().href, httpCommandParams);

  const observable$ = action$.pipe(
    switchMap<null | TSubjectValue, Observable<HttpCommand<TResponseBody>>>(
      (subjectValue) => {
        if (subjectValue === null) {
          return of<HttpIdleState>({ state: "idle" });
        }

        const request$ = getRequestObservablePartial(subjectValue).pipe(
          map<HttpResponse<TResponseBody>, HttpCommand<TResponseBody>>(
            (httpResponse) => {
              return {
                state: "success",
                response:
                  httpResponse as HttpResponseWithNonNullBody<TResponseBody>,
              };
            },
          ),
          catchError<
            HttpCommand<TResponseBody>,
            ReturnType<typeof handleObservableError>
          >((errorResponse) => handleObservableError(errorResponse)),
        );

        return request$.pipe(
          startWith<HttpCommand<TResponseBody>>({ state: "pending" }),
          catchError<HttpCommand<TResponseBody>, Observable<HttpErrorState>>(
            (error: HandledObservableError) =>
              of<HttpErrorState>({ state: "error", error }),
          ),
        );
      },
    ),
  );

  return {
    url: urlSignal,
    subject,
    observable$,
  };
}
