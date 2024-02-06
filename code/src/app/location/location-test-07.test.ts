import { GeolocationService } from "@ng-web-apis/geolocation";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/angular";
import { Subject } from "rxjs";
import { expect, test } from "vitest";
import { ObservableLocationComponent } from "./observable-location.component";

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

  const locationSubject = new Subject<GeolocationPosition>();
  const mockedGeolocationService = locationSubject.asObservable();

  await render(ObservableLocationComponent, {
    componentProviders: [
      {
        provide: GeolocationService,
        useValue: mockedGeolocationService,
      },
    ],
  });

  expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();

  locationSubject.next(fakePosition);

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

  const locationSubject = new Subject<GeolocationPosition>();
  const mockedGeolocationService = locationSubject.asObservable();

  await render(ObservableLocationComponent, {
    componentProviders: [
      {
        provide: GeolocationService,
        useValue: mockedGeolocationService,
      },
    ],
  });

  expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();

  locationSubject.error(fakeError);

  await waitForElementToBeRemoved(() => screen.queryByLabelText(/loading/i));

  expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument();

  expect(screen.getByRole("alert")).toHaveTextContent(fakeError.message);
});
