import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { startPerformanceMonitor } from "./common/profiler";

startPerformanceMonitor(10_000, (changeDetectionPerfRecord) => {
  fetch("https://api.example.com/profiler", {
    method: "post",
    credentials: "include",
    body: JSON.stringify(changeDetectionPerfRecord),
  });
});

@Component({
  selector: "app-authenticated-app",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [``],
  template: `
    <div>auth</div>
  `,
})
export class AuthenticatedAppComponent {}
