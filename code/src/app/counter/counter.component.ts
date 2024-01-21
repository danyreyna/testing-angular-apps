import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";

@Component({
  selector: "app-counter",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article>
      <p>Current count: {{ count() }}</p>
      <button (click)="decrement()">Decrement</button>
      <button (click)="increment()">Increment</button>
    </article>
  `,
})
export class CounterComponent {
  protected readonly count = signal(0);

  protected increment() {
    this.count.update((c) => c + 1);
  }

  protected decrement() {
    this.count.update((c) => c - 1);
  }
}
