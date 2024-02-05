import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, DefaultValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'shared-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
    DefaultValueAccessor
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @Input({ required: true }) options!: any[];
  @Input() placeholder?: string;
  @Input() optionLabel?: string;
  @Input() optionValue?: string;
  @Input() disabled?: boolean = false;
  @Input() showClear?: boolean = false;
  @Input() error?: boolean = false;
  @Input({ required: true }) formControlName!: string;
  @Input({ required: true }) formGroup!: FormGroup;
  @Output() selectChange: EventEmitter<any> = new EventEmitter();
  @Output() selectClear: EventEmitter<void> = new EventEmitter<void>();

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

  onSelectChange(event: any): void {
    this.innerValue = event.value;
    this.onChange(this.innerValue);
    this.onTouch();

    if (event.originalEvent && event.originalEvent.type === 'clear') {
      this.selectClear.emit();
    }

    this.selectChange.emit(event.value);
  }
}
