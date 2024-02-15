import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from "@angular/common/http";
import { inject } from "@angular/core";
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

function getRequestObservable<TSubjectValue, TResponse>(
  url: string,
  httpParams: HttpCommandParams,
  subjectValue: TSubjectValue,
) {
  const http = inject(HttpClient);

  const { method, options } = httpParams;

  switch (method) {
    case "delete":
      return http.delete<TResponse>(url, options);
    case "patch":
    case "post":
    case "put": {
      const { shouldSendBodyFromSubject = true } = httpParams;

      return http.patch<TResponse>(
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

export function getHttpCommand<TResponse = null, TSubjectValue = null>(
  getUrl: () => string,
  httpCommandParams: HttpCommandParams,
) {
  type TResponseWithState = CommandWithState<TResponse>;
  type TSuccessResponse = SuccessResponse<TResponse>;

  const subject = new BehaviorSubject<null | TSubjectValue>(null);
  const action$ = subject.asObservable();

  const response = action$.pipe(
    switchMap((subjectValue) => {
      if (subjectValue === null) {
        return INITIAL_IDLE_STATE;
      }

      const request$ = getRequestObservable<TSubjectValue, TResponse>(
        getUrl(),
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
    subject,
    response,
  };
}
