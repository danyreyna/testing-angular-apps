type HttpPathParams = Record<string, string>;
type HttpQueryParams = Record<string, string | string[]>;

export type GroupedUrlParams = {
  pathParams?: HttpPathParams;
  queryParams?: HttpQueryParams;
};

export type HttpUrlArgument<TParams extends GroupedUrlParams> = {
  href: URL["href"];
  pathParams?: TParams["pathParams"];
  queryParams?: TParams["queryParams"];
};

export type HttpUrl<TParams extends GroupedUrlParams> = {
  href: URL["href"];
  pathParams: NonNullable<TParams["pathParams"]>;
  queryParams: NonNullable<TParams["queryParams"]>;
};
