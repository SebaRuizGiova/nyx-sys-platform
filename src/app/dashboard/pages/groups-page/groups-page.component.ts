import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
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
  public formatDownloadItems?: string[];
  public rangeDownloadItems?: string[];
  public orderByItems?: string[];
  public userId!: string;
  public usersList: any;
  public teamsList: ItemDropdown[] = [];
  public selectedTeamIndex: number = 0;

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService,
    private databaseService: DatabaseService
  ) {
    this.langSubscription = this.languageService.langChanged$.subscribe(() => {
      this.loadTranslations();
    });
    this.databaseService.teamsList$.subscribe((teams) => {
      this.teamsList = teams;
    });

    this.databaseService.selectedTeamIndex$.subscribe((index) => {
      this.selectedTeamIndex = index;
      this.teamForm.patchValue({
        selectedTeam: this.teamsList[this.selectedTeamIndex],
      });
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
    selectedTeam: null,
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
    this.languageService
      .getTranslate('groupOrderByItems')
      .subscribe((translations: any) => {
        this.orderByItems = translations;
      });
  }

  nextGroup() {
    if (this.teamsList[this.selectedTeamIndex + 1]) {
      this.teamForm.patchValue({
        selectedTeam: this.teamsList[this.selectedTeamIndex + 1],
      });
      localStorage.setItem(
        'selectedTeam',
        this.teamForm.value.selectedTeam.value
      );
      this.databaseService.setSelectedTeamIndex(this.selectedTeamIndex + 1);
    }
  }

  backGroup() {
    if (this.teamsList[this.selectedTeamIndex - 1]) {
      this.teamForm.patchValue({
        selectedTeam: this.teamsList[this.selectedTeamIndex - 1],
      });
      localStorage.setItem(
        'selectedTeam',
        this.teamForm.value.selectedTeam.value
      );
      this.databaseService.setSelectedTeamIndex(this.selectedTeamIndex - 1);
    }
  }

  selectTeam() {
    const indexSelected = this.teamsList.findIndex(
      (team) => team.value === this.teamForm.value.selectedTeam.value
    );
    this.selectedTeamIndex = indexSelected;
    localStorage.setItem(
      'selectedTeam',
      this.teamForm.value.selectedTeam.value
    );
  }
}
