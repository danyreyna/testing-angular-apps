import "@analogjs/vite-plugin-angular/setup-vitest";
import { IDBFactory } from "fake-indexeddb";
import { getTestBed } from "@angular/core/testing";
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from "@angular/platform-browser-dynamic/testing";
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "../mocks/index";

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

vi.mock("../../src/app/common/profiler");

/*
 * Run this `afterEach` first to get back to real timers before any other cleanup.
 * Use real timers by default.
 * Individual tests can enable fake timers if they need to.
 * If they did, run all the pending timers and use real timers.
 */
afterEach(async () => {
  if (vi.isMockFunction(setTimeout)) {
    await vi.runOnlyPendingTimersAsync();
    vi.useRealTimers();
  }
});

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
  await fetch("https://api.example.com/logout", {
    method: "POST",
    credentials: "include",
  });
  await fetch(`https://api.example.com/user?source=test`, {
    method: "DELETE",
    credentials: "include",
  });

  // eslint-disable-next-line no-global-assign
  indexedDB = new IDBFactory();
});
