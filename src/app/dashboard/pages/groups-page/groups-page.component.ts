import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, forkJoin, map, mergeMap, of, tap } from 'rxjs';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { LanguageService } from 'src/app/shared/services/language.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { Profile } from '../../interfaces/profile.interface';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  templateUrl: './groups-page.component.html',
  styleUrls: ['./groups-page.component.scss'],
})
export class GroupsPageComponent implements OnInit, OnDestroy {
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
  public selectedGroupId: string =
    localStorage.getItem('selectedGroup') || '';
  public selectedGroupIndex: number =
    Number(localStorage.getItem('selectedGroupIndex')) || 0;
  public profiles: Profile[] = [];
  private role: string | null = localStorage.getItem('role');

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService,
    private databaseService: DatabaseService,
    private loadingService: LoadingService,
    private authService: AuthService
  ) {
    const selectedGroupId = localStorage.getItem('selectedGroup');
    if (selectedGroupId) {
      debugger
      const selectedGroup = this.groupsList.find(group => group.value === selectedGroupId);
      const selectedGroupIndex = this.groupsList.findIndex(group => group.value === selectedGroupId);
      if (selectedGroup) {
        this.groupForm.patchValue({
          selectedGroup
        });
        this.selectedGroupId = selectedGroup.value.toString();
        this.selectedGroupIndex = selectedGroupIndex;
        localStorage.setItem('selectedGroupIndex', selectedGroupIndex.toString())
      }
    }
  }

  ngOnInit(): void {
    this.languageService.langChanged$.subscribe(() => {
      this.loadTranslations();
    });

    this.loadData();
  }

  ngOnDestroy(): void {
    // this.subscriptions.forEach((subscription) => subscription.unsubscribe());
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
    this.languageService
      .getTranslate('groupOrderByItems')
      .subscribe((translations: any) => {
        this.orderByItems = translations;
      });
  }

  loadData() {
    this.loadingService.setLoading(true);
    if (this.role === 'superAdmin') {
      this.databaseService.getAllUsers().subscribe((users) => {
        const observables = users.map((user: any) =>
          this.databaseService.getGroupsByUser(this.authService.userId)
        );

        forkJoin(observables).subscribe((formattedGroupsArray: any) => {
          const formattedGroups = formattedGroupsArray.reduce(
            (acc: any, groups: any) => acc.concat(groups),
            []
          );
          this.groupsList = formattedGroups;
          this.databaseService.setGroupsList([
            ...this.groupsList,
            ...formattedGroups,
          ]);
          if (this.groupsList.length) {
            let selectedGroup;
            if (this.selectedGroupId) {
              selectedGroup = this.groupsList.find(
                (group) => group.value === this.selectedGroupId
              );
            } else {
              selectedGroup = this.groupsList[0];
            }
            this.groupForm.patchValue({
              selectedGroup,
            });
          }
          this.loadingService.setLoading(false);
        });
      });
    } else {
      this.databaseService
        .getGroupsByUser(this.authService.userId)
        .pipe(
          mergeMap((groups) => {
            this.groupsList = groups;
            this.databaseService.setGroupsList([...this.groupsList, ...groups]);
            if (this.groupsList.length) {
              let selectedGroup;
              if (this.selectedGroupId) {
                selectedGroup = this.groupsList.find(
                  (group) => group.value === this.selectedGroupId
                );
              } else {
                selectedGroup = this.groupsList[0];
              }
              this.groupForm.patchValue({
                selectedGroup,
              });
              if (selectedGroup) {
                this.loadingService.setLoading(true);
                return this.databaseService.getProfilesByGroup(
                  selectedGroup.value.toString()
                );
              }
            }
            return of([]);
          })
        )
        .subscribe((profiles) => {
          this.profiles = profiles;
          this.loadingService.setLoading(false);
        });
    }
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
      this.selectedGroupIndex = this.selectedGroupIndex + 1;
      localStorage.setItem('selectedGroupIndex', this.selectedGroupIndex.toString())
      this.selectGroup(this.groupForm.value.selectedGroup.value);
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
      this.selectedGroupIndex = this.selectedGroupIndex - 1;
      localStorage.setItem('selectedGroupIndex', this.selectedGroupIndex.toString())
      this.selectGroup(this.groupForm.value.selectedGroup.value);
    }
  }

  selectGroup(groupId: string) {
    const selectedGroup = this.groupsList.find(group => group.value === groupId);
    this.groupForm.patchValue({
      selectedGroup
    })
    if (selectedGroup) {
      localStorage.setItem('selectedGroup', selectedGroup.value.toString());
    }
    const groupIndex = this.groupsList.findIndex(group => group.value === groupId);
    this.selectedGroupIndex = groupIndex;
    localStorage.setItem('selectedGroupIndex', groupIndex.toString())
    this.loadingService.setLoading(true);
    this.databaseService.getProfilesByGroup(groupId).subscribe((profiles) => {
      this.profiles = profiles;
      this.loadingService.setLoading(false);
    });
  }
}
