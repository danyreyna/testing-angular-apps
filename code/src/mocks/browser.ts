import { setupWorker } from "msw/browser";
import { handlers as someApiHandlers } from "../../tests/mocks/some-api";

export const worker = setupWorker(...someApiHandlers);
