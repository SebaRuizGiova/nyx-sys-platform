import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { LanguageService } from 'src/app/shared/services/language.service';

@Component({
  templateUrl: './groups-page.component.html',
  styleUrls: ['./groups-page.component.scss'],
})
export class GroupsPageComponent implements OnDestroy, OnInit {
  private langSubscription: Subscription;
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
  public formatDownloadItems: string[] = ['PDF', 'Excel'];
  public rangeDownloadItems: string[] = [
    'Periodo actual',
    '7 días',
    '15 días',
    '30 días',
    'Histórico',
  ];
  public orderByItems: string[] = [
    'Puntaje de sueño: mayor a menor',
    'Puntaje de sueño: menor a mayor',
  ];

  constructor(
    private fb: FormBuilder,
    public languageService: LanguageService
  ) {
    this.langSubscription = this.languageService.langChanged$.subscribe(() => {
      this.loadTranslations();
    });
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.langSubscription.unsubscribe();
  }

  public periodForm: FormGroup = this.fb.group({
    period: '',
  });
  public teamForm: FormGroup = this.fb.group({
    selectedTeam: '',
  });
  public downloadForm: FormGroup = this.fb.group({
    format: ['', Validators.required],
    range: ['', Validators.required],
  });
  public filtersForm: FormGroup = this.fb.group({
    searchByName: '',
    orderBy: '',
    actualProfile: false,
  });

  private loadTranslations() {
    this.languageService.getTranslate('groupRangeDownloadItems').subscribe((translations: any) => {
      this.rangeDownloadItems = translations;
    });
    this.languageService.getTranslate('groupOrderByItems').subscribe((translations: any) => {
      this.orderByItems = translations;
    });
  }
}
