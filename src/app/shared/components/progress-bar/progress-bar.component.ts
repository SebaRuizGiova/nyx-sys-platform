import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {
  @Input() progress: number = 0;
  @Input() variant?: 'light' | 'dark' = 'light';
  @Input() width?: string = '100%';
}
