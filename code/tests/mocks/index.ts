import { setupServer } from "msw/node";
import { handlers as fakeBackendHandlers } from "./fake-backend";
import { handlers as monitoringServiceApiHandlers } from "./monitoring-service-api";
import { handlers as someApiHandlers } from "./some-api";

export const server = setupServer(
  ...someApiHandlers,
  ...fakeBackendHandlers,
  ...monitoringServiceApiHandlers,
);
