export function objectToFormData(object: Record<string, string | Blob>) {
  return Object.entries(object).reduce((accumulator, [key, value]) => {
    accumulator.append(key, value);
    return accumulator;
  }, new FormData());
}
