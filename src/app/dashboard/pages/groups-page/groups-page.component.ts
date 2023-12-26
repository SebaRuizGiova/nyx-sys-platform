import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { LanguageService } from 'src/app/shared/services/language.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { Status, Profile, SleepData } from '../../interfaces/profile.interface';
import { AuthService } from 'src/app/auth/services/auth.service';
import { User } from '../../interfaces/user.interface';
import { HelpersService } from 'src/app/shared/services/helpers.service';
import { Group } from '../../interfaces/group.interface';

@Component({
  templateUrl: './groups-page.component.html',
  styleUrls: ['./groups-page.component.scss'],
})
export class GroupsPageComponent implements OnInit {
  public periodForm: FormGroup = this.fb.group({
    period: this.helpersService.getActualDate(),
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
    orderBy: true,
    actualPeriod: false,
  });

  public periodItems: ItemDropdown[] = [];
  public formatDownloadItems?: string[];
  public rangeDownloadItems?: string[];
  public orderByItems?: string[];
  public groupsItems: ItemDropdown[] = [];
  public usersList: User[] = [];
  public selectedGroupId: string = localStorage.getItem('selectedGroup') || '';
  public selectedGroupIndex: number = 0;
  public filteredProfiles: Profile[] = [];
  public profiles: Profile[] = [];
  public selectedSleepData?: SleepData;

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService,
    private databaseService: DatabaseService,
    private loadingService: LoadingService,
    private authService: AuthService,
    private helpersService: HelpersService
  ) {}

  ngOnInit(): void {
    this.languageService.langChanged$.subscribe(() => {
      this.loadTranslations();
    });
    this.loadTranslations();
    this.loadData();
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
    if (this.authService.role === 'superAdmin') {
      this.loadDataAdmin();
    } else {
      this.loadDataUser();
    }
  }

  async loadDataAdmin() {
    try {
      this.loadingService.setLoading(true);
      const users = await this.getAllUsers();
      users.forEach((user) => {
        this.usersList.push(user.data());
      });

      const groupsPromises = this.usersList.map((user) => {
        return this.getGroupsByUser(user.id);
      });
      const resultsGroups = await Promise.all(groupsPromises);
      resultsGroups.forEach((groupsResult) => {
        groupsResult.forEach((groupDocs) => {
          const groupData: Group = groupDocs.data();
          const groupItem: ItemDropdown = {
            label: groupData.teamName,
            value: groupData.id,
            userId: groupData.userID,
          };
          this.groupsItems.push(groupItem);
          if (this.selectedGroupId) {
            this.selectedGroupIndex = this.groupsItems.findIndex(
              (group) => group.value === this.selectedGroupId
            );
            this.groupForm.patchValue({
              selectedGroup: this.groupsItems[this.selectedGroupIndex],
            });
          } else {
            this.selectedGroupIndex = 0;
            const selectedGroup = this.groupsItems[0];
            this.groupForm.patchValue({
              selectedGroup,
            });
            localStorage.setItem(
              'selectedGroup',
              this.groupsItems[0].value.toString()
            );
          }
        });
      });

      await this.loadProfiles();
      this.loadingService.setLoading(false);
    } catch (error) {
      console.log(error);
      this.loadingService.setLoading(false);
    }
  }

  async loadDataUser() {
    try {
      this.loadingService.setLoading(true);

      const groupsDocs = await this.getGroupsByUser(this.authService.userId);

      groupsDocs.forEach((groupDoc) => {
        const groupData: Group = groupDoc.data();
        const groupItem: ItemDropdown = {
          label: groupData.teamName,
          value: groupData.id,
          userId: groupData.userID,
        };
        this.groupsItems.push(groupItem);
        if (this.selectedGroupId) {
          this.selectedGroupIndex = this.groupsItems.findIndex(
            (group) => group.value === this.selectedGroupId
          );
          this.groupForm.patchValue({
            selectedGroup: this.groupsItems[this.selectedGroupIndex],
          });
        } else {
          this.selectedGroupIndex = 0;
          const selectedGroup = this.groupsItems[0];
          this.groupForm.patchValue({
            selectedGroup,
          });
          localStorage.setItem(
            'selectedGroup',
            this.groupsItems[0].value.toString()
          );
        }
      });

      await this.loadProfiles();
      this.loadingService.setLoading(false);
    } catch (error) {
      console.log(error);
      this.loadingService.setLoading(false);
    }
  }

  async loadProfiles() {
    const profiles = await this.getProfilesByGroup(
      this.groupForm.value.selectedGroup.userId || '',
      this.groupForm.value.selectedGroup.value.toString()
    );
    const profilePromises = profiles.map((profile) => {
      return new Promise(async (resolve, reject) => {
        try {
          const sleepDataSnapshot =
            await this.databaseService.getSleepDataPromise(
              this.groupForm.value.selectedGroup.userId,
              profile.id
            );
          const sleepData = sleepDataSnapshot.docs.map((doc) => doc.data());
          const profileData = profile.data();
          const status = await this.getStatusDevice(profileData.deviceSN);
          resolve({
            ...profileData,
            sleepData,
            status,
          });
        } catch (error) {
          reject(error);
        }
      });
    });
    const resultProfiles = await Promise.all(profilePromises);
    await Promise.all(profilePromises);
    this.profiles = [];
    resultProfiles.forEach((profile: any) => {
      this.profiles.push(profile);
    });
    this.filteredProfiles = this.profiles;
    this.periodItems = this.helpersService.generatePeriods(this.profiles);
    this.selectSleepData();
    this.filterProfiles();
  }

  getAllUsers(): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const usersSnapshot = await this.databaseService.getAllUsersPromise();
        resolve(usersSnapshot.docs);
      } catch (error) {
        reject(error);
      }
    });
  }

  getGroupsByUser(userId: string): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const groupsSnapshot =
          await this.databaseService.getGroupsByUserPromise(userId);
        resolve(groupsSnapshot.docs);
      } catch (error) {
        reject(error);
      }
    });
  }

  getProfilesByGroup(userId: string, teamId: string): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const profilesSnapshot =
          await this.databaseService.getProfilesByGroupPromise(userId, teamId);
        resolve(profilesSnapshot.docs);
      } catch (error) {
        reject(error);
      }
    });
  }

  getStatusDevice(deviceId: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const liveDataSnapshot = await this.databaseService.getLiveDataPromise(
          deviceId
        );
        const liveData: any[] = liveDataSnapshot.docs.map((doc) => doc.data());

        const onlineCondition =
          liveData.filter((data: any) => data.activity === 0).length >= 2;
        const activityCondition =
          liveData.filter((data: any) => data.activity !== 0).length >= 2;

        let mapLiveData: Status;

        if (
          liveData.length === 0 &&
          this.helpersService.compareDates(
            this.helpersService.formatTimestampToDate(
              liveData[0]?.date_occurred
            ),
            this.periodForm.value.period
          ) === 0
        ) {
          mapLiveData = { status: 'Offline' };
        } else if (
          onlineCondition &&
          this.helpersService.compareDates(
            this.helpersService.formatTimestampToDate(
              liveData[0]?.date_occurred
            ),
            this.periodForm.value.period
          ) === 0
        ) {
          mapLiveData = { status: 'Online' };
        } else if (
          activityCondition &&
          this.helpersService.compareDates(
            this.helpersService.formatTimestampToDate(
              liveData[0].date_occurred
            ),
            this.periodForm.value.period
          ) === 0
        ) {
          mapLiveData = { status: 'En actividad' };
        } else {
          mapLiveData = { status: 'Offline' };
        }
        resolve(mapLiveData);
      } catch (error) {
        reject(error);
      }
    });
  }

  nextGroup() {
    if (this.groupsItems[this.selectedGroupIndex + 1]) {
      this.groupForm.patchValue({
        selectedGroup: this.groupsItems[this.selectedGroupIndex + 1],
      });
      localStorage.setItem(
        'selectedGroup',
        this.groupForm.value.selectedGroup.value
      );
      this.selectedGroupIndex = this.selectedGroupIndex + 1;
      this.selectGroup(this.groupForm.value.selectedGroup.value);
    }
  }

  backGroup() {
    if (this.groupsItems[this.selectedGroupIndex - 1]) {
      this.groupForm.patchValue({
        selectedGroup: this.groupsItems[this.selectedGroupIndex - 1],
      });
      localStorage.setItem(
        'selectedGroup',
        this.groupForm.value.selectedGroup.value
      );
      this.selectedGroupIndex = this.selectedGroupIndex - 1;
      this.selectGroup(this.groupForm.value.selectedGroup.value);
    }
  }

  async selectGroup(groupId: string) {
    const selectedGroup = this.groupsItems.find(
      (group) => group.value === groupId
    );
    this.groupForm.patchValue({
      selectedGroup,
    });
    if (selectedGroup) {
      localStorage.setItem('selectedGroup', selectedGroup.value.toString());
    }
    const groupIndex = this.groupsItems.findIndex(
      (group) => group.value === groupId
    );
    this.selectedGroupIndex = groupIndex;
    this.loadingService.setLoading(true);

    await this.loadProfiles();
    this.loadingService.setLoading(false);
  }

  selectSleepData(selectedPeriod: string = this.periodForm.value.period) {
    this.profiles = this.profiles.map((profile) => {
      const selectedSleepData = profile.sleepData.find((sd) => {
        const periodData = this.helpersService.formatTimestampToDate(sd.to);
        return periodData === selectedPeriod;
      });
      const previousSleepData = profile.sleepData.find((sd) => {
        return (
          this.helpersService.compareDates(
            this.helpersService.formatTimestampToDate(sd.to),
            selectedPeriod
          ) === 1
        );
      });
      return {
        ...profile,
        selectedSleepData,
        previousSleepData,
      };
    });
    this.filteredProfiles = this.profiles;
  }

  filterProfiles() {
    this.filteredProfiles = this.profiles.filter(
      (profile) =>
        (profile.name
          .toLowerCase()
          .includes(this.filtersForm.value.searchByName.toLowerCase()) ||
          profile.lastName
            .toLowerCase()
            .includes(this.filtersForm.value.searchByName.toLowerCase())) &&
        (this.filtersForm.value.actualPeriod ? profile.selectedSleepData : true)
    );
    this.filteredProfiles.sort((a, b) => {
      const scoreA = a.selectedSleepData?.sleep_score || 0;
      const scoreB = b.selectedSleepData?.sleep_score || 0;

      // Ordenar de forma descendente
      return this.filtersForm.value.orderBy ? scoreB - scoreA : scoreA - scoreB;
    });
  }
}
