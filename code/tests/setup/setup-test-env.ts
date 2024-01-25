import "@analogjs/vite-plugin-angular/setup-vitest";
import { getTestBed } from "@angular/core/testing";
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from "@angular/platform-browser-dynamic/testing";
import "@testing-library/jest-dom/vitest";
import { TextEncoder } from "node:util";

globalThis.TextEncoder = TextEncoder;

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
