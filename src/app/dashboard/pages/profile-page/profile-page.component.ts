import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { LanguageService } from 'src/app/shared/services/language.service';

@Component({
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit {
  public periodForm: FormGroup = this.fb.group({
    period: ''
  });
  public gmtForm: FormGroup = this.fb.group({
    gmt: ''
  });
  public userForm: FormGroup = this.fb.group({
    user: ''
  });
  public downloadForm: FormGroup = this.fb.group({
    format: ['', Validators.required],
    range: ['', Validators.required],
  });

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
  public usersItems: ItemDropdown[] = [
    {
      label: 'Sebastian Ruiz',
      value: 1,
    },
    {
      label: 'Fernando Lerner',
      value: 2,
    },
    {
      label: 'Lucas Gonzalez',
      value: 3,
    },
  ];
  public formatDownloadItems?: string[];
  public rangeDownloadItems?: string[];
  public gmtOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadTranslations();
  }

  private loadTranslations() {
    this.languageService
      .getTranslate('groupFormatDownloadItems')
      .subscribe((translations: any) => {
        this.formatDownloadItems = translations;
      });
    this.languageService
      .getTranslate('groupRangeDownloadItems')
      .subscribe((translations: any) => {
        this.rangeDownloadItems = translations;
      });
  }
}
