import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/angular";
import { BehaviorSubject } from "rxjs";
import { expect, test, vi } from "vitest";
import { createMock } from "../../../tests/utils";
import { LocationComponent } from "./location.component";
import {
  type GeolocationResponseWithState,
  LocationService,
} from "./location.service";

test("displays the users current location", async () => {
  const fakePosition = {
    coords: {
      accuracy: 35,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      latitude: 35,
      longitude: 139,
      speed: null,
    },
    timestamp: Date.now(),
  };

  const locationSubject = new BehaviorSubject<GeolocationResponseWithState>({
    state: "pending",
  });
  const mockedLocationService = createMock(LocationService);
  mockedLocationService.getLocation = vi.fn(() =>
    locationSubject.asObservable(),
  );

  await render(LocationComponent, {
    componentProviders: [
      {
        provide: LocationService,
        useValue: mockedLocationService,
      },
    ],
  });

  expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();

  locationSubject.next({ state: "success", data: fakePosition });

  await waitForElementToBeRemoved(() => screen.queryByLabelText(/loading/i));

  expect(screen.getByText(/latitude/i)).toHaveTextContent(
    `Latitude: ${fakePosition.coords.latitude}`,
  );
  expect(screen.getByText(/longitude/i)).toHaveTextContent(
    `Longitude: ${fakePosition.coords.longitude}`,
  );
});

test("displays error message when geolocation is not supported", async () => {
  const fakeError = new Error(
    "Geolocation is not supported or permission denied",
  );

  const locationSubject = new BehaviorSubject<GeolocationResponseWithState>({
    state: "pending",
  });
  const mockedLocationService = createMock(LocationService);
  mockedLocationService.getLocation = vi.fn(() =>
    locationSubject.asObservable(),
  );

  await render(LocationComponent, {
    componentProviders: [
      {
        provide: LocationService,
        useValue: mockedLocationService,
      },
    ],
  });

  expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();

  locationSubject.next({
    state: "error",
    message: fakeError.message,
  });

  await waitForElementToBeRemoved(() => screen.queryByLabelText(/loading/i));

  expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument();

  expect(screen.getByRole("alert")).toHaveTextContent(fakeError.message);
});
