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
import type {
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
>(url: string, httpParams: HttpCommandParams, subjectValue: TSubjectValue) {
  const http = inject(HttpClient);

  const { method } = httpParams;

  switch (method) {
    case "delete": {
      const { options } = httpParams;
      return http.delete<TResponse>(url, options);
    }
    case "patch": {
      const { shouldSendBodyFromSubject = true, options } = httpParams;

      return http.patch<TResponse>(
        url,
        shouldSendBodyFromSubject ? subjectValue : null,
        options,
      );
    }
    case "post": {
      const { shouldSendBodyFromSubject = true, options } = httpParams;

      return http.post<TResponse>(
        url,
        shouldSendBodyFromSubject ? subjectValue : null,
        options,
      );
    }
    case "put": {
      const { shouldSendBodyFromSubject = true, options } = httpParams;

      return http.put<TResponse>(
        url,
        shouldSendBodyFromSubject ? subjectValue : null,
        options,
      );
    }
    default: {
      const exhaustiveCheck: never = method;
      return exhaustiveCheck;
    }
  }
}

type InputHttpUrl<
  TPathParams extends HttpPathParams,
  TQueryParams extends HttpQueryParams,
> = {
  href: URL["href"];
  pathParams?: TPathParams;
  queryParams?: TQueryParams;
};

export type HttpPathParams = Record<string, string>;
export type HttpQueryParams = Record<string, string | string[]>;

type OutputHttpUrl<
  TPathParams extends HttpPathParams,
  TQueryParams extends HttpQueryParams,
> = Required<InputHttpUrl<TPathParams, TQueryParams>>;

type HttpUrlParams = {
  pathParams?: HttpPathParams;
  queryParams?: HttpQueryParams;
};

export type HttpUrl<TUrlParams extends HttpUrlParams = HttpUrlParams> =
  OutputHttpUrl<
    NonNullable<TUrlParams["pathParams"]>,
    NonNullable<TUrlParams["queryParams"]>
  >;

export type GetHttpCommandResult<
  TResponse extends JSONTypes = null,
  TSubjectValue extends JSONTypes = null,
  TUrlParams extends HttpUrlParams = HttpUrlParams,
> = {
  url: Signal<HttpUrl<TUrlParams>>;
  subject: BehaviorSubject<null | TSubjectValue>;
  response: Observable<CommandWithState<TResponse>>;
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
  type TResponseWithState = CommandWithState<TResponse>;
  type TSuccessResponse = SuccessResponse<TResponse>;

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

  const subject = new BehaviorSubject<null | TSubjectValue>(null);
  const action$ = subject.asObservable();

  const response = action$.pipe(
    switchMap((subjectValue) => {
      if (subjectValue === null) {
        return INITIAL_IDLE_STATE;
      }

      if (typeof url === "string") {
        urlState.set({ href: url });
      } else {
        urlState.set(url());
      }

      const request$ = getRequestObservable<TResponse, TSubjectValue>(
        urlSignal().href,
        httpCommandParams,
        subjectValue,
      ).pipe(
        map<TResponse, TSuccessResponse>((response) => ({
          state: "success",
          data: response,
        })),
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
