import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';

@Component({
  templateUrl: './groups-page.component.html',
  styleUrls: ['./groups-page.component.scss'],
})
export class GroupsPageComponent {
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
