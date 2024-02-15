import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { INDIGO_DARKEN_10_COLOR } from "../styles/colors";

@Component({
  selector: "app-book-spinner",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @-webkit-keyframes whirl-book {
      0% {
        -webkit-transform: rotateY(0deg);
        transform: rotateY(0deg);
      }
      50%,
      80% {
        -webkit-transform: rotateY(-180deg);
        transform: rotateY(-180deg);
      }
      90%,
      100% {
        opacity: 0;
        -webkit-transform: rotateY(-180deg);
        transform: rotateY(-180deg);
      }
    }

    @keyframes whirl-book {
      0% {
        -webkit-transform: rotateY(0deg);
        transform: rotateY(0deg);
      }
      50%,
      80% {
        -webkit-transform: rotateY(-180deg);
        transform: rotateY(-180deg);
      }
      90%,
      100% {
        opacity: 0;
        -webkit-transform: rotateY(-180deg);
        transform: rotateY(-180deg);
      }
    }

    .book {
      height: 60px;
      position: relative;
      width: 60px;
      -webkit-perspective: 120px;
      perspective: 120px;
    }

    .book div {
      -webkit-animation: whirl-book 1s infinite;
      animation: whirl-book 1s infinite;
      background: ${INDIGO_DARKEN_10_COLOR};
      height: 100%;
      position: absolute;
      left: 50%;
      -webkit-transform-origin: left;
      transform-origin: left;
      width: 100%;
    }

    .book div:nth-child(1) {
      -webkit-animation-delay: 0.075s;
      animation-delay: 0.075s;
    }

    .book div:nth-child(2) {
      -webkit-animation-delay: 0.15s;
      animation-delay: 0.15s;
    }

    .book div:nth-child(3) {
      -webkit-animation-delay: 0.225s;
      animation-delay: 0.225s;
    }

    .book div:nth-child(4) {
      -webkit-animation-delay: 0.3s;
      animation-delay: 0.3s;
    }

    .book div:nth-child(5) {
      -webkit-animation-delay: 0.375s;
      animation-delay: 0.375s;
    }
    `,
  template: `
    <div class="book">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  `,
})
export class BookSpinnerComponent {}
