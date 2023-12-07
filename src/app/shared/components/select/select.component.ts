import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownItem } from 'primeng/dropdown';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'shared-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @Input({ required: true }) options!: DropdownItem[];
  @Input() placeholder?: string;
  @Input() optionLabel?: string;
  @Input() optionValue?: string;
  @Input({ required: true }) formControlName!: string;
  @Input({ required: true }) formGroup!: FormGroup;

  private onChange: any = () => {};
  private onTouch: any = () => {};
  private innerValue: string = '';

  writeValue(value: any): void {
    this.innerValue = value;
    this.onChange(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
}
