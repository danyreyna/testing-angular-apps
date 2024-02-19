export function toPxInputTransformer(value: string | undefined) {
  return `${value ?? 1}px`;
}
