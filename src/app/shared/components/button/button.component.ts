import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() label?: string;
  @Input() icon?: string;
  @Input() iconPos: 'right' | 'left' = 'right';
  @Input() tooltipButton?: string;
  @Input() tooltipPosition?: 'right' | 'left' | 'top' | 'bottom';
}
