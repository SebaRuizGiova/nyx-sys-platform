import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ItemDropdown } from '../dropdown/dropdown.component';

@Component({
  selector: 'shared-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserDropdownComponent),
      multi: true,
    },
  ],
})
export class UserDropdownComponent implements ControlValueAccessor {
  @Input() tooltipButton?: string;
  @Input() tooltipPosition?: 'right' | 'left' | 'top' | 'bottom';
  @Input() position?: 'right-bottom' | 'right-top' | 'left-bottom' | 'left-top' | 'center-bottom' = 'right-bottom';
  @Input() items?: ItemDropdown[] = [];
  @Input() formGroup!: FormGroup;
  @Input() formControlName!: string;
  @Input() userName?: string;
  @Input() device?: string;
  @Input() age?: string;
  @Input() status?: string;
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
    this.innerValue = event;
    this.onChange(this.innerValue);
    this.onTouch();
    this.tooglePopup();
    this.dropdownChange.emit(event);
  }
}
