import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface ItemDropdown {
  label: string;
  value: string | number | any;
  userId?: string;
  img?: string;
}

@Component({
  selector: 'shared-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
})
export class DropdownComponent implements ControlValueAccessor {

  @Input() labelButton?: string;
  @Input() tooltipButton?: string;
  @Input() tooltipPosition?: 'right' | 'left' | 'top' | 'bottom';
  @Input() iconButton?: string;
  @Input() position?: 'right-bottom' | 'right-top' | 'left-bottom' | 'left-top' | 'center-bottom' = 'right-bottom';
  @Input() items?: ItemDropdown[] = [];
  @Input() formGroup!: FormGroup;
  @Input() formControlName!: string;
  @Input() noButton: boolean = false;
  @Input() secondaryAction?: Function;
  @Output() dropdownChange: EventEmitter<any> = new EventEmitter();

  public showPopup: boolean = false;
  private onChange: any = () => {};
  private onTouch: any = () => {};
  private innerValue: string = '';

  tooglePopup() {
    this.showPopup = !this.showPopup;
  }

  writeValue(value: any): void {
    this.innerValue = value;
    this.onChange(this.innerValue);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  onDropdownChange(event: any): void {
    this.innerValue = event.value;
    this.onChange(this.innerValue);
    this.onTouch();
    this.tooglePopup();
    this.dropdownChange.emit(event.value);
  }
}
