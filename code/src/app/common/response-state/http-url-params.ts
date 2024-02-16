export type HttpPathParams = Record<string, string>;
export type HttpQueryParams = Record<string, string | string[]>;

export type HttpUrlParams = {
  pathParams?: HttpPathParams;
  queryParams?: HttpQueryParams;
};

export type InputHttpUrl<
  TPathParams extends HttpPathParams,
  TQueryParams extends HttpQueryParams,
> = {
  href: URL["href"];
  pathParams?: TPathParams;
  queryParams?: TQueryParams;
};

export type HttpUrl<TUrlParams extends HttpUrlParams = HttpUrlParams> =
  Required<
    InputHttpUrl<
      NonNullable<TUrlParams["pathParams"]>,
      NonNullable<TUrlParams["queryParams"]>
    >
  >;
