import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {
  @Input() progress: number = 0;
  @Input() color: string = '';
  // @Input() width?: string = '100%';
}
