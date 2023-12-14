import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { LanguageService } from 'src/app/shared/services/language.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { Player } from '../../interfaces/player.interface';

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
  public groupsList: ItemDropdown[] = [];
  public selectedGroup: string = '';
  public selectedGroupIndex: number = 0;
  public players: Player[] = [];

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService,
    private databaseService: DatabaseService,
    private loadingService: LoadingService
  ) {
    this.langSubscription = this.languageService.langChanged$.subscribe(() => {
      this.loadTranslations();
    });
    this.databaseService.groupsList$.subscribe((groups) => {
      this.groupsList = groups;
    });

    this.databaseService.selectedGroup$.subscribe((id) => {
      this.selectedGroup = id;
      loadingService.setLoading(true);
      this.databaseService.getProfilesByGroup(this.selectedGroup).subscribe({
        next: players => {
          this.players = players;
        },
        complete: () => {
          loadingService.setLoading(false);
        }
      })
    });

    this.databaseService.selectedGroupIndex$.subscribe((index) => {
      this.selectedGroupIndex = index;
      this.groupForm.patchValue({
        selectedGroup: this.groupsList[this.selectedGroupIndex],
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
  public groupForm: FormGroup = this.fb.group({
    selectedGroup: null,
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
    if (this.groupsList[this.selectedGroupIndex + 1]) {
      this.groupForm.patchValue({
        selectedGroup: this.groupsList[this.selectedGroupIndex + 1],
      });
      localStorage.setItem(
        'selectedGroup',
        this.groupForm.value.selectedGroup.value
      );
      this.databaseService.setSelectedGroupIndex(this.selectedGroupIndex + 1);
    }
  }

  backGroup() {
    if (this.groupsList[this.selectedGroupIndex - 1]) {
      this.groupForm.patchValue({
        selectedGroup: this.groupsList[this.selectedGroupIndex - 1],
      });
      localStorage.setItem(
        'selectedGroup',
        this.groupForm.value.selectedGroup.value
      );
      this.databaseService.setSelectedGroupIndex(this.selectedGroupIndex - 1);
    }
  }

  selectGroup() {
    const indexSelected = this.groupsList.findIndex(
      (group) => group.value === this.groupForm.value.selectedGroup.value
    );
    this.databaseService.setSelectedGroupIndex(indexSelected);
    this.databaseService.setSelectedGroup(this.groupForm.value.selectedGroup.value);
    localStorage.setItem(
      'selectedGroup',
      this.groupForm.value.selectedGroup.value
    );
  }
}
