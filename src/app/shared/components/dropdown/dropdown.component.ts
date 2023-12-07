import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface ItemDropdown {
  label: string;
  value: string | number;
}

@Component({
  selector: 'shared-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent {

  @Input() labelButton?: string;
  @Input() tooltipButton?: string;
  @Input() tooltipPosition?: 'right' | 'left' | 'top' | 'bottom';
  @Input() iconButton?: string;
  @Input() position?: 'right-bottom' | 'right-top' | 'left-bottom' | 'left-top' = 'right-bottom';
  @Input() items?: ItemDropdown[] = [];
  @Input() formGroup!: FormGroup;
  @Input() formControlName!: string;
  @Input() noButton?: boolean = false;

  public showPopup: boolean = false;

  tooglePopup() {
    this.showPopup = !this.showPopup;
  }

  selectItem(value: any) {
    const selectedControl = this.formGroup.get(this.formControlName);
    if (selectedControl) {
      selectedControl.setValue(value);
    }
  }
}
