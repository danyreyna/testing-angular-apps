/*
 * https://www.rfc-editor.org/rfc/rfc6901
 *
 * The following types are mostly for documentation purposes,
 * since TypeScript has limitations working with individual characters in strings:
 * - `Unescaped`
 * - `Escaped`
 * - `ReferenceToken`
 * - `ArrayIndex`
 */

/*
 * %x2F ('/') and %x7E ('~') are excluded from 'unescaped'.
 */
type Unescaped<TChar extends string = string> = TChar extends "/" | "~"
  ? never
  : TChar;

/*
 * Representing '~' and '/', respectively.
 */
type Escaped = "~0" | "~1";

type ReferenceToken = "" | `${Unescaped | Escaped}`;

type ArrayIndex =
  | "-"
  | "0"
  | `${"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"}${"" | bigint}`;

type Segment = `${ReferenceToken | ArrayIndex}`;

/*
 * `""` is the document's root.
 * `"/"` points to a JSON key of `""`.
 * '~' needs to be encoded as `"~0"`.
 * '/' needs to be encoded as `"~1"`.
 * In arrays, the `"-"` index indicates the member after the last array element.
 * Leading zeros are not allowed in array indices.
 */
export type Rfc6901JsonPointer =
  | ""
  | `/${Segment}`
  | [Segment, Segment, ...Segment[]];

export function getRfc6901JsonPointerAsString(jsonPointer: Rfc6901JsonPointer) {
  if (typeof jsonPointer === "string") {
    return jsonPointer;
  }

  return jsonPointer.join("/");
}
