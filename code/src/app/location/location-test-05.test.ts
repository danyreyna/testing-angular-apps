import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/angular";
import { beforeAll, expect, test, vi } from "vitest";
import { LocationComponent } from "./location.component";

const mockedGeolocation = {
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

beforeAll(() => {
  Object.defineProperty(window.navigator, "geolocation", {
    value: mockedGeolocation,
  });
});

function deferred() {
  let resolve: (value?: unknown) => void = () => {};
  let reject: (reason?: unknown) => void = () => {};

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

test("displays the users current location", async () => {
  const fakePosition = {
    coords: {
      latitude: 35,
      longitude: 139,
    },
  };

  const { promise, resolve } = deferred();

  mockedGeolocation.watchPosition.mockImplementation((successCallback) => {
    promise.then(() => successCallback(fakePosition));
  });

  await render(LocationComponent);

  expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();

  resolve();

  await waitForElementToBeRemoved(() => screen.queryByLabelText(/loading/i));

  expect(screen.getByText(/latitude/i)).toHaveTextContent(
    `Latitude: ${fakePosition.coords.latitude}`,
  );
  expect(screen.getByText(/longitude/i)).toHaveTextContent(
    `Longitude: ${fakePosition.coords.longitude}`,
  );
});

test("displays an error message when geolocation is not supported", async () => {
  const fakeError = new Error(
    "Geolocation is not supported or permission denied",
  );

  const { promise, reject } = deferred();

  mockedGeolocation.watchPosition.mockImplementation((_, errorCallback) => {
    promise.catch(() => errorCallback(fakeError));
  });

  await render(LocationComponent);

  expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();

  reject();

  await waitForElementToBeRemoved(() => screen.queryByLabelText(/loading/i));

  expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument();

  expect(screen.getByRole("alert")).toHaveTextContent(fakeError.message);
});
