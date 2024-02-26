export type Rfc9457ProblemDetail = {
  type?: string;
  status?: number;
  title?: string;
  detail?: string;
  instance?: string;
};

/*
 * Add an "errors" extension to the Problem Detail
 * https://www.rfc-editor.org/rfc/rfc9457.html#name-extension-members
 */
export type RequiredPropertiesProblemDetail = Rfc9457ProblemDetail & {
  errors: { title: string; detail: string }[];
};
