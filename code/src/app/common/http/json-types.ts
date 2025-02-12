export type JsonPrimitives = string | number | boolean | null;

export type ObjectLike = { [key: string]: JsonTypes };

export type JsonTypes =
  | JsonPrimitives
  | Readonly<ObjectLike>
  | ObjectLike
  | ReadonlyArray<JsonTypes>
  | JsonTypes[];
