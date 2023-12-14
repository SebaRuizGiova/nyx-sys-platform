import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface ItemDropdown {
  label: string;
  value: string | number;
  userId?: string;
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

  public showPopup: boolean = false;
  private onChange: any = () => {};
  private onTouch: any = () => {};
  private innerValue: string = '';

  tooglePopup() {
    this.showPopup = !this.showPopup;
  }

  selectItem(value: any) {
    const selectedControl = this.formGroup.get(this.formControlName);
    if (selectedControl) {
      selectedControl.setValue(value);
      this.showPopup = false
      if (this.secondaryAction) {
        this.secondaryAction();
      }
    }
  }

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
