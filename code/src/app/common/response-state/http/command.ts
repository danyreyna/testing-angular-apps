import {
  HttpClient,
  type HttpContext,
  type HttpResponse,
} from "@angular/common/http";
import { inject, signal } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  map,
  type Observable,
  of,
  startWith,
  switchMap,
  tap,
} from "rxjs";
import {
  type HandledObservableError,
  handleObservableError,
} from "../../error/handle-observable-error";
import type { JSONTypes } from "../../json-types";
import {
  type HttpCommand,
  type HttpCommandErrorState,
  type HttpCommandIdleState,
  type HttpCommandSuccessState,
  type HttpCommandVariables,
  isHttpCommandError,
  isHttpCommandSuccess,
} from "./command-state";
import type { HttpResponseWithNonNullBody, RequestHeaders } from "./types";

type AngularHttpOptions = {
  context?: HttpContext;
  reportProgress?: boolean;
  responseType?: "json";
  withCredentials?: boolean;
};

type CommandFnOptions<
  TRequestHeaders extends RequestHeaders,
  TRequestBody extends JSONTypes,
> = {
  http?: HttpClient;
  headers?: TRequestHeaders;
  body?: TRequestBody;
} & AngularHttpOptions;

export function httpDelete<
  TResponseBody extends JSONTypes,
  TRequestHeaders extends RequestHeaders = RequestHeaders,
  TRequestBody extends JSONTypes = null,
>(url: string, options?: CommandFnOptions<TRequestHeaders, TRequestBody>) {
  const http = options?.http ?? inject(HttpClient);

  return http.delete<TResponseBody>(url, {
    ...options,
    observe: "response",
  });
}

export function httpPatch<
  TResponseBody extends JSONTypes,
  TRequestBody extends JSONTypes = null,
  TRequestHeaders extends RequestHeaders = RequestHeaders,
>(url: string, options: CommandFnOptions<TRequestHeaders, TRequestBody> = {}) {
  const http = options?.http ?? inject(HttpClient);

  const { body, ...rest } = options;

  return http.patch<TResponseBody>(url, body ?? null, {
    ...rest,
    observe: "response",
  });
}

type AngularHttpPostOptions = {
  transferCache?:
    | {
        includeHeaders?: string[];
      }
    | boolean;
};

type PostFnOptions<
  TRequestHeaders extends RequestHeaders,
  TRequestBody extends JSONTypes,
> = CommandFnOptions<TRequestHeaders, TRequestBody> & AngularHttpPostOptions;

export function httpPost<
  TResponseBody extends JSONTypes,
  TRequestBody extends JSONTypes = null,
  TRequestHeaders extends RequestHeaders = RequestHeaders,
>(url: string, options: PostFnOptions<TRequestHeaders, TRequestBody> = {}) {
  const http = options?.http ?? inject(HttpClient);

  const { body, ...rest } = options;

  return http.post<TResponseBody>(url, body ?? null, {
    ...rest,
    observe: "response",
  });
}

export function httpPut<
  TResponseBody extends JSONTypes,
  TRequestBody extends JSONTypes = null,
  TRequestHeaders extends RequestHeaders = RequestHeaders,
>(url: string, options: CommandFnOptions<TRequestHeaders, TRequestBody> = {}) {
  const http = options?.http ?? inject(HttpClient);

  const { body, ...rest } = options;

  return http.put<TResponseBody>(url, body ?? null, {
    ...rest,
    observe: "response",
  });
}

type HttpCommandOptions<
  TResponseBody extends JSONTypes,
  TVariables extends void | HttpCommandVariables,
  TContext,
> = {
  commandFn: (variables: TVariables) => Observable<HttpResponse<TResponseBody>>;
  onRequest?: (
    variables: TVariables,
  ) => Promise<null | TContext> | null | TContext;
  onSettled?: (
    httpResult:
      | HttpCommandErrorState<TVariables>
      | HttpCommandSuccessState<TResponseBody, TVariables>,
    context: TContext,
  ) => Promise<void> | void;
  onError?: (
    httpResult: HttpCommandErrorState<TVariables>,
    context: TContext,
  ) => Promise<void> | void;
  onSuccess?: (
    httpResult: HttpCommandSuccessState<TResponseBody, TVariables>,
    context: TContext,
  ) => Promise<void> | void;
};

type ReturnTypeGetHttpCommand<
  TResponseBody extends JSONTypes,
  TVariables extends void | HttpCommandVariables,
> = {
  run: (variables: TVariables) => void;
  reset: () => void;
  observable$: Observable<HttpCommand<TResponseBody, TVariables>>;
};

export function getHttpCommand<
  TResponseBody extends JSONTypes,
  TVariables extends void | HttpCommandVariables = void,
  TContext = unknown,
>(
  options: HttpCommandOptions<TResponseBody, TVariables, TContext>,
): ReturnTypeGetHttpCommand<TResponseBody, TVariables> {
  const {
    commandFn,
    onRequest: handleRequest,
    onSettled: handleSettled,
    onError: handleError,
    onSuccess: handleSuccess,
  } = options;

  const subject = new BehaviorSubject<null | TVariables>(null);
  const action$ = subject.asObservable();

  const context = signal<null | TContext>(null);

  const observable$ = action$.pipe(
    switchMap<
      null | TVariables,
      Observable<HttpCommand<TResponseBody, TVariables>>
    >((variables) => {
      if (variables === null) {
        return of<HttpCommandIdleState>({ state: "idle" });
      }

      const request$ = commandFn(variables).pipe(
        map<
          HttpResponse<TResponseBody>,
          HttpCommand<TResponseBody, TVariables>
        >((httpResponse) => {
          return {
            state: "success",
            response:
              httpResponse as HttpResponseWithNonNullBody<TResponseBody>,
            variables,
          };
        }),
        catchError<
          HttpCommand<TResponseBody, TVariables>,
          ReturnType<typeof handleObservableError>
        >((errorResponse) => handleObservableError(errorResponse)),
      );

      return request$.pipe(
        tap(async (httpResult) => {
          if (httpResult.state === "pending" && handleRequest !== undefined) {
            context.set(await handleRequest(variables));
          }
        }),
        startWith<HttpCommand<TResponseBody, TVariables>>({
          state: "pending",
        }),
        catchError<
          HttpCommand<TResponseBody, TVariables>,
          Observable<HttpCommandErrorState<TVariables>>
        >((observableError: HandledObservableError) =>
          of<HttpCommandErrorState<TVariables>>({
            state: "error",
            error: observableError,
            variables,
          }),
        ),
        tap((httpResult) => {
          if (
            handleSettled !== undefined &&
            (isHttpCommandError<TVariables>(httpResult) ||
              isHttpCommandSuccess<TResponseBody, TVariables>(httpResult))
          ) {
            handleSettled(httpResult, context()!);
          }

          if (
            handleError !== undefined &&
            isHttpCommandError<TVariables>(httpResult)
          ) {
            handleError(httpResult, context()!);
          }

          if (
            handleSuccess !== undefined &&
            isHttpCommandSuccess<TResponseBody, TVariables>(httpResult)
          ) {
            handleSuccess(httpResult, context()!);
          }
        }),
      );
    }),
  );

  function run(variables: TVariables) {
    subject.next(variables);
  }

  function reset() {
    subject.next(null);
  }

  return {
    run,
    reset,
    observable$,
  };
}
