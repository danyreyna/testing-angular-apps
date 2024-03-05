import { Routes } from "@angular/router";
import { BookScreenComponent } from "./book-screen/book-screen.component";
import { CounterComponent } from "./counter/counter.component";
import { DiscoverBooksComponent } from "./discover-books/discover-books.component";
import { FinishedScreenComponent } from "./finished-screen/finished-screen.component";
import { LocationComponent } from "./location/location.component";
import { ObservableLocationComponent } from "./location/observable-location.component";
import { LoginReactiveComponent } from "./login-reactive/login-reactive.component";
import { LoginSubmissionComponent } from "./login-submission/login-submission.component";
import { LoginTemplateDrivenComponent } from "./login-template-driven/login-template-driven.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { ReadingListComponent } from "./reading-list/reading-list.component";
import { SomeButtonUsageComponent } from "./some-button/some-button-usage.component";

export const routes: Routes = [
  { path: "list", component: ReadingListComponent },
  { path: "finished", component: FinishedScreenComponent },
  { path: "discover", component: DiscoverBooksComponent },
  { path: "book/:bookId", component: BookScreenComponent },
  { path: "counter", component: CounterComponent },
  { path: "login-template-driven", component: LoginTemplateDrivenComponent },
  { path: "login-reactive", component: LoginReactiveComponent },
  { path: "login-submission", component: LoginSubmissionComponent },
  { path: "observable-location", component: ObservableLocationComponent },
  { path: "location", component: LocationComponent },
  { path: "some-button", component: SomeButtonUsageComponent },
  { path: "**", component: NotFoundComponent },
];
