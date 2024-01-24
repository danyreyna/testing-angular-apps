import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  type OnInit,
  signal,
} from "@angular/core";

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
export class CounterComponent implements OnInit {
  @Input()
  protected readonly initialCount = 0;

  protected readonly count = signal(0);

  ngOnInit() {
    if (this.initialCount !== undefined) {
      this.count.set(this.initialCount);
    }
  }

  protected increment() {
    this.count.update((c) => c + 1);
  }

  protected decrement() {
    this.count.update((c) => c - 1);
  }
}
