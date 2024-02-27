import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { TimezoneService } from 'src/app/shared/services/timezoneService.service';
import { Message } from 'primeng/api';

@Component({
  templateUrl: './groups-page.component.html',
  styleUrls: ['./groups-page.component.scss'],
})
export class GroupsPageComponent implements OnInit, OnDestroy {
  public periodForm: FormGroup = this.fb.group({
    period: this.helpersService.getActualDate(
      this.timezoneService.timezoneOffset
    ),
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
  public userRole: string = '';
  public showWarnProfiles: boolean = false;
  public warnMessage: Message[] = [
    { severity: 'warn', summary: '', detail: 'Closable Message Content' },
  ];

  private intervalId: any;

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService,
    private databaseService: DatabaseService,
    private loadingService: LoadingService,
    private authService: AuthService,
    private helpersService: HelpersService,
    private timezoneService: TimezoneService
  ) {}

  ngOnInit(): void {
    this.languageService.langChanged$.subscribe(() => {
      this.loadTranslations();
    });
    this.loadTranslations();
    this.loadingService.setLoading(true);
    this.authService.checkRole().subscribe((role) => {
      this.userRole = role;
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
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
    this.languageService
      .getTranslate('profileWarnProfiles')
      .subscribe((translation: any) => {
        this.warnMessage = [{
          ...this.warnMessage[0],
          detail: translation
        }];
      });
  }

  loadData() {
    if (this.userRole === 'superAdmin') {
      this.loadDataAdmin();
    } else {
      this.loadDataUser();
    }
    this.intervalId = setInterval(async () => {
      if (this.profiles.length) {
        const updatedProfiles = await Promise.all(
          this.profiles.map(async (profile) => {
            try {
              const liveData = await this.getStatusDevice(
                profile.deviceSN.toString()
              );
              // Actualizar solo la propiedad liveData de cada perfil
              return {
                ...profile,
                liveData,
              };
            } catch (error) {
              console.error('Error updating profile:', error);
              return profile; // Mantener el perfil sin cambios en caso de error
            }
          })
        );
        // Copiar solo la propiedad liveData actualizada de cada perfil al array profiles
        updatedProfiles.forEach((updatedProfile, index) => {
          this.profiles[index].liveData = updatedProfile.liveData;
        });
      }
    }, 5000);
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
    try {
      const profiles = await this.getProfilesByGroup(
        this.groupForm.value.selectedGroup.userId || '',
        this.groupForm.value.selectedGroup.value.toString()
      );
      const profilePromises = profiles.map((profile) => {
        return new Promise(async (resolve, reject) => {
          try {
            const sleepDataPromise =
              this.databaseService.getSleepDataWithLimitCollection(
                this.groupForm.value.selectedGroup.userId,
                profile.id
              );
            const profileData = profile.data();
            const liveDataPromise = this.getStatusDevice(profileData.deviceSN);
            const results = await Promise.all([
              sleepDataPromise,
              liveDataPromise,
            ]);
            const sleepDataSnapshot = results[0];
            const sleepData = sleepDataSnapshot.docs.map((doc) => doc.data());
            const status = results[1];
            resolve({
              ...profileData,
              sleepData,
              liveData: status,
            });
          } catch (error) {
            reject(error);
          }
        });
      });
      const resultProfiles = await Promise.all(profilePromises);
      this.profiles = [];
      resultProfiles.forEach((profile: any) => {
        this.profiles.push(profile);
      });
      this.filteredProfiles = this.profiles;
      this.showWarnProfiles = this.filteredProfiles.length ? false : true;
      this.periodItems = this.helpersService.generatePeriods(
        this.profiles,
        this.timezoneService.timezoneOffset
      );
      this.selectSleepData();
      this.filterProfiles();
      this.databaseService.setProfiles(this.profiles);
    } catch (error) {
      console.log(error);
      this.loadingService.setLoading(false);
    }
  }

  getAllUsers(): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const usersSnapshot =
          await this.databaseService.getAllUsersCollection();
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
          await this.databaseService.getGroupsByUserCollection(userId);
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
          await this.databaseService.getProfilesByGroupCollection(
            userId,
            teamId
          );
        resolve(profilesSnapshot.docs);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getStatusDevice(deviceId: string): Promise<Status> {
    return new Promise(async (resolve, reject) => {
      try {
        const liveDataSnapshot =
          await this.databaseService.getLiveDataCollection(deviceId);
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
              liveData[0]?.date_occurred,
              this.timezoneService.timezoneOffset
            ),
            this.helpersService.getActualDate(
              this.timezoneService.timezoneOffset
            ),
            this.timezoneService.timezoneOffset
          ) === 0
        ) {
          mapLiveData = { status: 'Offline' };
        } else if (
          onlineCondition &&
          this.helpersService.compareDates(
            this.helpersService.formatTimestampToDate(
              liveData[0]?.date_occurred,
              this.timezoneService.timezoneOffset
            ),
            this.helpersService.getActualDate(
              this.timezoneService.timezoneOffset
            ),
            this.timezoneService.timezoneOffset
          ) === 0
        ) {
          mapLiveData = { status: 'Online' };
        } else if (
          activityCondition &&
          this.helpersService.compareDates(
            this.helpersService.formatTimestampToDate(
              liveData[0].date_occurred,
              this.timezoneService.timezoneOffset
            ),
            this.helpersService.getActualDate(
              this.timezoneService.timezoneOffset
            ),
            this.timezoneService.timezoneOffset
          ) === 0
        ) {
          mapLiveData = { status: 'En actividad' };
        } else {
          mapLiveData = { status: 'Offline' };
        }
        resolve(mapLiveData);
      } catch (error) {
        resolve({ status: 'Offline' });
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
        const periodData = this.helpersService.formatTimestampToDate(
          sd.to,
          this.timezoneService.timezoneOffset
        );
        return periodData === selectedPeriod;
      });
      const previousSleepData = profile.sleepData.find((sd) => {
        return (
          this.helpersService.compareDates(
            this.helpersService.formatTimestampToDate(
              sd.to,
              this.timezoneService.timezoneOffset
            ),
            selectedPeriod,
            this.timezoneService.timezoneOffset
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
    this.filterProfiles();
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
    this.showWarnProfiles = this.filteredProfiles.length ? false : true;
  }
}
