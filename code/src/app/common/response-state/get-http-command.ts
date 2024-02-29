import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
  HttpResponse,
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
  type HandledHttpError,
  handleObservableError,
} from "../handle-observable-error";
import type { JSONTypes } from "../json-types";
import type { CommandWithState } from "./command-with-state";
import { type HttpRes, isHttpRes } from "./http-res";
import type { HttpUrl, HttpUrlParams, InputHttpUrl } from "./http-url-params";
import type {
  ErrorResponse,
  HttpErrorResponse,
  IdleState,
  SuccessResponse,
} from "./response-states";

const INITIAL_IDLE_STATE = of<IdleState>({ state: "idle" });

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
  TResponse extends JSONTypes,
  TSubjectValue extends JSONTypes,
>(url: string, httpParams: HttpCommandParams) {
  const http = inject(HttpClient);

  const { method } = httpParams;

  return (subjectValue: TSubjectValue) => {
    switch (method) {
      case "delete": {
        const { options } = httpParams;
        return http.delete<TResponse>(url, { ...options, observe: "response" });
      }
      case "patch": {
        const { shouldSendBodyFromSubject = true, options } = httpParams;

        return http.patch<TResponse>(
          url,
          shouldSendBodyFromSubject ? subjectValue : null,
          { ...options, observe: "response" },
        );
      }
      case "post": {
        const { shouldSendBodyFromSubject = true, options } = httpParams;

        return http.post<TResponse>(
          url,
          shouldSendBodyFromSubject ? subjectValue : null,
          { ...options, observe: "response" },
        );
      }
      case "put": {
        const { shouldSendBodyFromSubject = true, options } = httpParams;

        return http.put<TResponse>(
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

export type GetHttpCommandResult<
  TResponse extends JSONTypes = null,
  TSubjectValue extends JSONTypes = null,
  TUrlParams extends HttpUrlParams = HttpUrlParams,
> = {
  url: Signal<HttpUrl<TUrlParams>>;
  subject: BehaviorSubject<null | TSubjectValue>;
  response: Observable<CommandWithState<HttpRes<TResponse>>>;
};

export function getHttpCommand<
  TResponse extends JSONTypes = null,
  TSubjectValue extends JSONTypes = null,
  TUrlParams extends HttpUrlParams = HttpUrlParams,
>(
  url:
    | URL["href"]
    | (() => InputHttpUrl<
        NonNullable<TUrlParams["pathParams"]>,
        NonNullable<TUrlParams["queryParams"]>
      >),
  httpCommandParams: HttpCommandParams,
): GetHttpCommandResult<TResponse, TSubjectValue, TUrlParams> {
  type TResponseWithState = CommandWithState<HttpRes<TResponse>>;
  type TSuccessResponse = SuccessResponse<HttpRes<TResponse>>;

  const urlState = signal<
    InputHttpUrl<
      NonNullable<TUrlParams["pathParams"]>,
      NonNullable<TUrlParams["queryParams"]>
    >
  >(typeof url === "string" ? { href: url } : url());
  const urlSignal = computed(() => {
    const { href, pathParams, queryParams } = urlState();

    return {
      href,
      pathParams: pathParams ?? ({} as TUrlParams["pathParams"]),
      queryParams: queryParams ?? ({} as TUrlParams["queryParams"]),
    } as HttpUrl<TUrlParams>;
  });

  const subject = new BehaviorSubject<null | TSubjectValue>(null);
  const action$ = subject.asObservable();

  const getRequestObservablePartial = getRequestObservable<
    TResponse,
    TSubjectValue
  >(urlSignal().href, httpCommandParams);

  const response = action$.pipe(
    switchMap((subjectValue) => {
      if (subjectValue === null) {
        return INITIAL_IDLE_STATE;
      }

      const request$ = getRequestObservablePartial(subjectValue).pipe(
        map<HttpResponse<TResponse>, TSuccessResponse | ErrorResponse>(
          (httpResponse) => {
            if (isHttpRes(httpResponse)) {
              return {
                state: "success",
                data: httpResponse,
              };
            }

            return {
              state: "error",
              message: "The body is null",
            };
          },
        ),
        catchError((errorResponse) => handleObservableError(errorResponse)),
      );

      return request$.pipe(
        startWith<TResponseWithState>({ state: "pending" }),
        catchError((error: HandledHttpError) =>
          of<HttpErrorResponse>({
            state: "error",
            message: error.message,
            status: error.status,
          }),
        ),
      );
    }),
  );

  return {
    url: urlSignal,
    subject,
    response,
  };
}
