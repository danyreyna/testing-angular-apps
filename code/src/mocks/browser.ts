import { setupWorker } from "msw/browser";
import { handlers as fakeBackendHandlers } from "../../tests/mocks/fake-backend";

export const worker = setupWorker(...fakeBackendHandlers);
