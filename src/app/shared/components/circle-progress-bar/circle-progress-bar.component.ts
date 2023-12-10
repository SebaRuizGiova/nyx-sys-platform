import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-circle-progress-bar',
  templateUrl: './circle-progress-bar.component.html',
  styleUrls: ['./circle-progress-bar.component.scss']
})
export class CircleProgressBarComponent {
  @Input() sleepScore: number = 0;
  public max: number = 100;
}
