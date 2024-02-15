import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from "@angular/common/http";
import { computed, inject, signal } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  map,
  of,
  startWith,
  switchMap,
} from "rxjs";
import {
  type HandledObservableError,
  handleObservableError,
} from "../handle-observable-error";
import type { JSONTypes } from "../json-types";
import type { CommandWithState } from "./command-with-state";
import type {
  ErrorResponse,
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

function getRequestObservable<TResponse, TSubjectValue>(
  url: string,
  httpParams: HttpCommandParams,
  subjectValue: TSubjectValue,
) {
  const http = inject(HttpClient);

  const { method, options } = httpParams;

  switch (method) {
    case "delete":
      return http.delete<TResponse>(url, options);
    case "patch": {
      const { shouldSendBodyFromSubject = true } = httpParams;

      return http.patch<TResponse>(
        url,
        shouldSendBodyFromSubject ? subjectValue : null,
        options,
      );
    }
    case "post": {
      const { shouldSendBodyFromSubject = true } = httpParams;

      return http.post<TResponse>(
        url,
        shouldSendBodyFromSubject ? subjectValue : null,
        options,
      );
    }
    case "put": {
      const { shouldSendBodyFromSubject = true } = httpParams;

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

type InputHttpUrl<TPathParams> = {
  href: URL["href"];
  pathParams?: TPathParams;
};

export type HttpPathParams = Record<string, string>;

export type HttpUrl<TPathParams extends HttpPathParams = HttpPathParams> =
  Required<InputHttpUrl<TPathParams>>;

export function getHttpCommand<
  TResponse extends JSONTypes = null,
  TSubjectValue extends JSONTypes = null,
  TPathParams extends HttpPathParams = HttpPathParams,
>(
  getHttpCommandUrl: () => InputHttpUrl<TPathParams>,
  httpCommandParams: HttpCommandParams,
) {
  type TResponseWithState = CommandWithState<TResponse>;
  type TSuccessResponse = SuccessResponse<TResponse>;

  const urlState = signal<InputHttpUrl<TPathParams>>({
    href: "",
  });
  const url = computed<HttpUrl<TPathParams>>(() => {
    const { href, pathParams } = urlState();

    return { href, pathParams: pathParams ?? ({} as TPathParams) };
  });

  const subject = new BehaviorSubject<null | TSubjectValue>(null);
  const action$ = subject.asObservable();

  const response = action$.pipe(
    switchMap((subjectValue) => {
      if (subjectValue === null) {
        return INITIAL_IDLE_STATE;
      }

      urlState.set(getHttpCommandUrl());

      const request$ = getRequestObservable<TResponse, TSubjectValue>(
        url().href,
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
        catchError((error: HandledObservableError) =>
          of<ErrorResponse>({
            state: "error",
            message: error.message,
          }),
        ),
      );
    }),
  );

  return {
    url,
    subject,
    response,
  };
}
