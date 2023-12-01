import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-input-password',
  templateUrl: './input-password.component.html',
  styleUrls: ['./input-password.component.scss']
})
export class InputPasswordComponent {
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Input() helper: string = '';
  @Input() error: boolean = false;
}
