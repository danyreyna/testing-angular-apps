import type { JsonTypes } from "./json-types";
import {
  getRfc6901JsonPointerAsString,
  type Rfc6901JsonPointer,
} from "./rfc-6901-json-pointer";

/*
 * https://www.rfc-editor.org/rfc/rfc6902
 *
 * If a normative requirement is violated by a JSON Patch document,
 * or if an operation is not successful,
 * evaluation of the JSON Patch document SHOULD terminate
 * and application of the entire patch document SHALL NOT be deemed successful.
 *
 * Each operation in the sequence is applied to the target document;
 * the resulting document becomes the target of the next operation.
 */
export type JsonPatch<TPath extends string | Rfc6901JsonPointer> =
  | /*
   * https://www.rfc-editor.org/rfc/rfc6902#section-4.1
   *
   * Array elements are shifted to the right.
   * Values of existing object members are replaced.
   */
  { op: "add"; path: TPath; value: JsonTypes }
  /*
   * https://www.rfc-editor.org/rfc/rfc6902#section-4.2
   *
   * Array elements are shifted to the left.
   */
  | { op: "remove"; path: TPath }
  | { op: "replace"; path: TPath; value: JsonTypes }
  /*
   * https://www.rfc-editor.org/rfc/rfc6902#section-4.4
   *
   * The "from" location cannot be moved into one of its children.
   */
  | { op: "move"; from: TPath; path: TPath }
  | { op: "copy"; from: TPath; path: TPath }
  /*
   * https://www.rfc-editor.org/rfc/rfc6902#section-4.6
   *
   * Asserts that a value at the target location is equal to a specified value.
   */
  | { op: "test"; path: TPath; value: JsonTypes };

export type Rfc6902JsonPatchParam = JsonPatch<Rfc6901JsonPointer>;

export type Rfc6902JsonPatch = JsonPatch<string>;

export function getRfc6902JsonPatchOperations(
  params: Rfc6902JsonPatchParam[],
): Rfc6902JsonPatch[] {
  return params.map((operation) => {
    const { op } = operation;

    switch (op) {
      case "add":
      case "remove":
      case "replace":
      case "test": {
        const { path } = operation;

        return {
          ...operation,
          path: getRfc6901JsonPointerAsString(path),
        };
      }
      case "move":
      case "copy": {
        const { from, path } = operation;

        return {
          ...operation,
          from: getRfc6901JsonPointerAsString(from),
          path: getRfc6901JsonPointerAsString(path),
        };
      }
      default: {
        const exhaustiveCheck: never = op;
        return exhaustiveCheck;
      }
    }
  });
}
