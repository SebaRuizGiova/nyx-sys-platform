import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'shared-input-password',
  templateUrl: './input-password.component.html',
  styleUrls: ['./input-password.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputPasswordComponent),
      multi: true,
    },
  ],
})
export class InputPasswordComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() formControlName: string = '';
  @Input() helper: string = '';
  @Input() error: boolean = false;

  private innerValue: string = '';

  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: string): void {
    this.innerValue = value;
    this.onChange(value); // Notify the form about the initial value
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  onInputChange(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.innerValue = inputValue;
    this.onChange(inputValue);
    this.onTouch();
  }
}
