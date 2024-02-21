export type JSONPrimitives = string | number | boolean | null;

export type ObjectLike = { [key: string]: JSONTypes };

export type JSONTypes =
  | JSONPrimitives
  | Readonly<ObjectLike>
  | ObjectLike
  | ReadonlyArray<JSONTypes>
  | JSONTypes[];
