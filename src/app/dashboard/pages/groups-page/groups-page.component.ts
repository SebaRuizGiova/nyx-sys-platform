import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, mergeMap, tap } from 'rxjs';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { LanguageService } from 'src/app/shared/services/language.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { Profile } from '../../interfaces/profile.interface';

@Component({
  templateUrl: './groups-page.component.html',
  styleUrls: ['./groups-page.component.scss'],
})
export class GroupsPageComponent implements OnInit {
  // private langSubscription: Subscription;
  // private groupsListSubscription: Subscription;
  // private selectedGroupIndexSubscription: Subscription;
  // private profilesSubscription: Subscription;
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
  public groupsList: ItemDropdown[];
  public selectedGroupId: string;
  public selectedGroupIndex: number;
  public profiles: Profile[];
  private role: string | null = localStorage.getItem('role');

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService,
    private databaseService: DatabaseService,
    private loadingService: LoadingService
  ) {
    this.groupsList = this.databaseService.groupsList;
    this.selectedGroupId = this.databaseService.selectedGroupId;
    this.selectedGroupIndex = this.databaseService.selectedGroupIndex;
    this.profiles = this.databaseService.profiles;
    this.groupForm.patchValue({
      selectedGroup: this.groupsList[this.selectedGroupIndex],
    });
  }

  ngOnInit(): void {
    this.languageService.langChanged$.subscribe(() => {
      this.loadTranslations();
    });

    this.databaseService.groupsList$.subscribe((groups) => {
      this.groupsList = groups;
    });

    this.databaseService.selectedGroupIndex$.subscribe((selectedGroupIndex) => {
      this.selectedGroupIndex = selectedGroupIndex;
      this.groupForm.patchValue({
        selectedGroup: this.groupsList[selectedGroupIndex],
      });
    });

    this.databaseService.selectedGroupId$
      .pipe(
        tap(() => this.loadingService.setLoading(true)),
        mergeMap((selectedGroup) => {
          const profiles$ =
            this.role === 'superAdmin'
              ? this.databaseService.getProfilesByGroup(
                  selectedGroup,
                  this.groupForm.value.selectedGroup?.userId
                )
              : this.databaseService.getProfilesByGroup(selectedGroup);

          return profiles$;
        })
      )
      .subscribe((profiles) => {
        this.profiles = profiles;
        this.databaseService.setProfiles(profiles);
        this.loadingService.setLoading(false);
      });
  }

  // ngOnDestroy(): void {
  //   this.langSubscription.unsubscribe();
  //   this.groupsListSubscription.unsubscribe();
  //   this.selectedGroupIndexSubscription.unsubscribe();
  //   this.profilesSubscription.unsubscribe();
  // }

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
      this.selectGroup();
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
      this.selectGroup();
    }
  }

  selectGroup() {
    const indexSelected = this.groupsList.findIndex(
      (group) => group.value === this.groupForm.value.selectedGroup.value
    );
    this.databaseService.setSelectedGroupIndex(indexSelected);
    this.databaseService.setSelectedGroupId(
      this.groupForm.value.selectedGroup.value
    );
    localStorage.setItem(
      'selectedGroup',
      this.groupForm.value.selectedGroup.value
    );
  }
}
