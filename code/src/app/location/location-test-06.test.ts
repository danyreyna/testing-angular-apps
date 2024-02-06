import { GeolocationService } from "@ng-web-apis/geolocation";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/angular";
import { afterEach, expect, test, vi } from "vitest";
import { LocationComponent } from "./location.component";

const hoistedMock = await vi.hoisted(async () => {
  const { Subject } = await import("rxjs");

  const locationSubjectRef = { current: new Subject<GeolocationPosition>() };
  const mockedGeolocationServiceRef = {
    current: locationSubjectRef.current.asObservable(),
  };

  function resetMock() {
    locationSubjectRef.current = new Subject<GeolocationPosition>();
    mockedGeolocationServiceRef.current =
      locationSubjectRef.current.asObservable();
  }

  return {
    locationSubjectRef,
    mockedGeolocationServiceRef,
    resetMock,
  };
});

vi.mock("@ng-web-apis/geolocation", () => {
  return {
    GeolocationService: hoistedMock.mockedGeolocationServiceRef.current,
  };
});

afterEach(() => {
  hoistedMock.resetMock();
});

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

  await render(LocationComponent, {
    componentProviders: [
      {
        provide: GeolocationService,
        useValue: hoistedMock.mockedGeolocationServiceRef.current,
      },
    ],
  });

  expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();

  hoistedMock.locationSubjectRef.current.next(fakePosition);

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

  await render(LocationComponent, {
    componentProviders: [
      {
        provide: GeolocationService,
        useValue: hoistedMock.mockedGeolocationServiceRef.current,
      },
    ],
  });

  expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();

  hoistedMock.locationSubjectRef.current.error(fakeError);

  await waitForElementToBeRemoved(() => screen.queryByLabelText(/loading/i));

  expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent(fakeError.message);
});
