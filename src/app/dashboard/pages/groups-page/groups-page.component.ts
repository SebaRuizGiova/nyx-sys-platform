import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, map, mergeMap, of } from 'rxjs';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { LanguageService } from 'src/app/shared/services/language.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { Profile, SleepData } from '../../interfaces/profile.interface';
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
    orderBy: '',
    actualProfile: false,
  });

  public periodItems: ItemDropdown[] = [];
  public formatDownloadItems?: string[];
  public rangeDownloadItems?: string[];
  public orderByItems?: string[];
  public groupsItems: ItemDropdown[] = [];
  public usersList: User[] = [];
  public selectedGroupId: string = localStorage.getItem('selectedGroup') || '';
  public selectedGroupIndex: number = 0;
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
            this.profiles.push({
              ...profileData,
              sleepData,
            });
            this.periodItems = this.helpersService.generatePeriods(
              this.profiles
            );
            this.selectSleepData();
            resolve(null);
          } catch (error) {
            reject(error);
          }
        });
      });
      await Promise.all(profilePromises);
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
            resolve({
              ...profileData,
              sleepData,
            });
          } catch (error) {
            reject(error);
          }
        });
      });
      const resultProfiles = await Promise.all(profilePromises);
      resultProfiles.forEach((profile: any) => {
        this.profiles.push(profile);
      });
      this.periodItems = this.helpersService.generatePeriods(this.profiles);
      this.selectSleepData();
      this.loadingService.setLoading(false);
    } catch (error) {
      console.log(error);
      this.loadingService.setLoading(false);
    }
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
    debugger;
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
    const profilesDocsSnapshot =
      await this.databaseService.getProfilesByGroupPromise(
        selectedGroup?.userId || '',
        groupId
      );

    const profiles: Profile[] = []
    profilesDocsSnapshot.forEach((profileDoc) => {
      const profileData: Profile = <Profile>profileDoc.data();
      profiles.push(profileData);
    });
    const profilePromises = profiles.map((profile) => {
      return new Promise(async (resolve, reject) => {
        try {
          const sleepDataSnapshot =
            await this.databaseService.getSleepDataPromise(
              this.groupForm.value.selectedGroup.userId,
              profile.id
            );
          const sleepData = sleepDataSnapshot.docs.map((doc) => doc.data());
          resolve({
            ...profile,
            sleepData,
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
    this.periodItems = this.helpersService.generatePeriods(this.profiles);
    this.selectSleepData();
    this.loadingService.setLoading(false);
  }

  selectSleepData(selectedPeriod: string = this.periodForm.value.period) {
    this.profiles = this.profiles.map((profile) => {
      const selectedSleepData = profile.sleepData.find(
        (sd) => this.helpersService.formatTimestamp(sd.to) === selectedPeriod
      );
      const previousSleepData = profile.sleepData.find((sd) => {
        return (
          this.helpersService.compareDates(
            this.helpersService.formatTimestamp(sd.to),
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
  }
}
