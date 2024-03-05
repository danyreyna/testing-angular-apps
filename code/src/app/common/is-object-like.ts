export type JSPrimitives =
  | undefined
  | null
  | boolean
  | bigint
  | number
  | string
  | symbol;

export type ObjectLike = { [key: string]: JSTypes };

export type JSTypes =
  | JSPrimitives
  // eslint-disable-next-line @typescript-eslint/ban-types
  | Function
  | readonly JSTypes[]
  | JSTypes[]
  | Readonly<ObjectLike>
  | ObjectLike;

export function isObjectLike(
  value: unknown,
): value is ObjectLike | Readonly<ObjectLike> {
  return (
    value !== undefined &&
    value !== null &&
    typeof value !== "boolean" &&
    typeof value !== "bigint" &&
    typeof value !== "number" &&
    typeof value !== "string" &&
    typeof value !== "symbol" &&
    typeof value !== "function" &&
    !Array.isArray(value)
  );
}
