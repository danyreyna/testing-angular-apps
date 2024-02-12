import "@analogjs/vite-plugin-angular/setup-vitest";
import { getTestBed } from "@angular/core/testing";
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from "@angular/platform-browser-dynamic/testing";
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import * as auth from "../../some-auth-provider";
import { server } from "../mocks/index";

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

beforeAll(() => {
  server.listen();
});
afterAll(() => {
  server.close();
});
afterEach(() => {
  server.resetHandlers();
});

// general cleanup
afterEach(async () => {
  await auth.logout();
});
