import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';

@Component({
  templateUrl: './teams-page.component.html',
  styleUrls: ['./teams-page.component.scss'],
})
export class TeamsPageComponent {
  public periodItems: ItemDropdown[] = [
    {
      label: 'Periodo 1',
      value: 1,
    },
    {
      label: 'Periodo 2',
      value: 2,
    },
    {
      label: 'Periodo 3',
      value: 3,
    },
  ];

  constructor(private fb: FormBuilder) {}

  public periodForm: FormGroup = this.fb.group({
    period: '',
  });
  public teamForm: FormGroup = this.fb.group({
    selectedTeam: '',
  });
  public downloadForm: FormGroup = this.fb.group({
    format: '',
    range: ''
  });
  public filtersForm: FormGroup = this.fb.group({
    searchByName: '',
    orderBy: '',
    actualProfile: false,
  });
}
