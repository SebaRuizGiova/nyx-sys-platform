import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DropdownItem } from 'primeng/dropdown';

@Component({
  selector: 'shared-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent {
  @Input({ required: true }) options!: DropdownItem[];
  @Input() placeholder?: string;
  @Input() optionLabel?: string;
  @Input() optionValue?: string;
  @Input({ required: true }) formControlName!: string;
  @Input({ required: true }) formGroup!: FormGroup;
}
