import { setupWorker } from "msw/browser";
import { handlers as someTestApiHandlers } from "./some-test-api";

export const worker = setupWorker(...someTestApiHandlers);
