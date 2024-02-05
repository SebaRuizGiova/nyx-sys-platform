import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, DefaultValueAccessor } from '@angular/forms';

@Component({
  selector: 'shared-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true,
    },
    DefaultValueAccessor
  ],
})
export class InputTextComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() helper?: string = '';
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() formControlName: string = '';
  @Input() error?: boolean = false;
  @Output() inputChange: EventEmitter<any> = new EventEmitter();

  onChange: any = () => {};
  onTouch: any = () => {};
  private innerValue: string = '';

  writeValue(value: string): void {
    this.innerValue = value;
    this.onChange(value);
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
    this.onChange(this.innerValue);
    this.onTouch();
    this.inputChange.emit((event.target as HTMLInputElement).value);
  }
}
