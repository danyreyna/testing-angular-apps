export function handleError(error: Error) {
  /*
   * In a real world app, we may send the error to some remote logging infrastructure,
   * instead of just logging it to the console.
   */
  console.error(error);
}
