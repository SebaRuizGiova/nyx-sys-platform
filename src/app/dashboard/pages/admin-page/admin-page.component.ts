import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/services/auth.service';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { Profile } from '../../interfaces/profile.interface';
import { Device } from '../../interfaces/device.interface';
import { Group } from '../../interfaces/group.interface';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { User } from '../../interfaces/user.interface';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { Collaborator } from '../../interfaces/collaborator.interface';
import { forkJoin, mergeMap } from 'rxjs';

@Component({
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
  public actionsProfilesForm: FormGroup = this.fb.group({
    search: '',
    filterByGroup: '',
  });
  public actionsDevicesForm: FormGroup = this.fb.group({
    search: '',
    filterByGroup: '',
  });
  public actionsGroupsForm: FormGroup = this.fb.group({
    search: '',
  });
  public actionsCollaboratorsForm: FormGroup = this.fb.group({
    search: '',
  });
  public actionsUsersForm: FormGroup = this.fb.group({
    search: '',
  });
  public addProfileForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    birthdate: ['', Validators.required],
    gender: ['', Validators.required],
    birthplace: ['', Validators.required],
    user: ['', Validators.required]
  })

  public profiles: Profile[] = [];
  public devices: Device[] = [];
  public groups: Group[] = [];
  public collaborators: Collaborator[] = [];
  public users: User[] = [];

  public groupsOptions: ItemDropdown[] = [];
  public filteredProfiles: Profile[] = [];
  public filteredDevices: Device[] = [];
  public filteredGroups: Group[] = [];
  public filteredCollaborators: any[] = [];
  public filteredUsers: User[] = [];
  public dontShowHiddenProfiles: boolean = false;
  public dontShowHiddenDevices: boolean = false;
  public dontShowHiddenGroups: boolean = false;

  public role: string = this.authService.role;

  public showAddProfile: boolean = false;
  public showAddDevice: boolean = false;
  public showAddGroup: boolean = false;
  public showAddCollaborator: boolean = false;
  public showAddUser: boolean = false;

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    if (this.authService.role === 'superAdmin') {
      this.getDataAdmin();
    } else {
      this.getProfiles();
      this.getDevices();
      this.getGroups();
      this.getCollaborators();
    }
  }

  getProfiles(userId?: string) {
    this.loadingService.setLoading(true);
    this.databaseService
      .getProfilesByUser(userId || this.authService.userId)
      .subscribe((profiles) => {
        this.profiles = profiles;
        this.filteredProfiles = profiles;
        this.loadingService.setLoading(false);
      });
  }

  getDevices(userId?: string) {
    this.loadingService.setLoading(true);
    this.databaseService
      .getDevicesByUser(userId || this.authService.userId)
      .subscribe((devices) => {
        this.devices = devices;
        this.filteredDevices = devices;
        this.loadingService.setLoading(false);
      });
  }

  getGroups(userId?: string) {
    this.loadingService.setLoading(true);
    this.databaseService
      .getGroupsByUser(userId || this.authService.userId)
      .subscribe((groups) => {
        this.groups = groups;
        this.groupsOptions = groups.map((group: Group) => ({
          label: group.teamName,
          value: group.id,
        }));
        this.filteredGroups = groups;
        this.loadingService.setLoading(false);
      });
  }

  getCollaborators(userId?: string) {
    this.loadingService.setLoading(true);
    this.databaseService
      .getUserData(userId || this.authService.userId)
      .subscribe((user) => {
        this.collaborators = user.collaborators || [];
        this.collaborators[this.collaborators.length - 1];
        this.filteredCollaborators = user.collaborators || [];
      });
  }

  getDataAdmin() {
    this.loadingService.setLoading(true);
    this.databaseService
      .getAllUsers()
      .pipe(
        mergeMap((users) => {
          this.users = users;
          this.filteredUsers = users;
          const profilesObservables = users.map((user: User) => {
            const profiles$ = this.databaseService.getProfilesByUser(user.id);
            const devices$ = this.databaseService.getDevicesByUser(user.id);
            const groups$ = this.databaseService.getGroupsByUser(user.id);
            const userData$ = this.databaseService.getUserData(user.id);

            return forkJoin([profiles$, devices$, groups$, userData$]);
          });

          return forkJoin(profilesObservables);
        })
      )
      .subscribe((results: any) => {
        let profiles: Profile[] = [];
        let devices: Device[] = [];
        let groups: Group[] = [];
        let collaborators: Collaborator[] = [];
        results.forEach((result: any) => {
          profiles = [...profiles, ...result[0]];
        });
        results.forEach((result: any) => {
          devices = [...devices, ...result[1]];
        });
        results.forEach((result: any) => {
          groups = [...groups, ...result[2]];
        });
        results.forEach((result: any) => {
          collaborators = [...collaborators, result[3]];
        });

        const groupsOptions = groups.map(group => ({
          label: group.teamName,
          value: group.id
        }))

        this.profiles = profiles;
        this.filteredProfiles = profiles;
        this.devices = devices;
        this.filteredDevices = devices;
        this.groups = groups;
        this.filteredGroups = groups;
        this.groupsOptions = groupsOptions;
        this.collaborators = collaborators;
        this.filteredCollaborators = collaborators;
        this.loadingService.setLoading(false);
      });
  }

  filterProfiles(groupId?: string) {
    if (groupId) {
      this.filteredProfiles = this.profiles.filter((profile) => {
        return (
          (profile.name
            .toLowerCase()
            .includes(this.actionsProfilesForm.value.search.toLowerCase()) ||
            profile.lastName
              .toLowerCase()
              .includes(this.actionsProfilesForm.value.search.toLowerCase())) &&
          profile.teamID === groupId
        );
      });
    } else {
      this.filteredProfiles = this.profiles.filter((profile) => {
        return (
          profile.name
            .toLowerCase()
            .includes(this.actionsProfilesForm.value.search.toLowerCase()) ||
          (profile.lastName
            .toLowerCase()
            .includes(this.actionsProfilesForm.value.search.toLowerCase()) &&
            (this.dontShowHiddenProfiles ? !profile.hided : true))
        );
      });
    }
    if (this.dontShowHiddenProfiles) {
      this.filteredProfiles = this.filteredProfiles.filter(profile => !profile.hided)
    }
  }

  toggleHiddenProfiles() {
    this.dontShowHiddenProfiles = !this.dontShowHiddenProfiles;
    this.filterProfiles()
  }

  filterDevices(groupId?: string) {
    if (groupId) {
      this.filteredDevices = this.devices.filter((device) => {
        return (
          device.serialNumber
            .toLowerCase()
            .includes(this.actionsDevicesForm.value.search.toLowerCase()) &&
          device.teamID === groupId
        );
      });
    } else {
      this.filteredDevices = this.devices.filter((device) => {
        return device.serialNumber
          .toLowerCase()
          .includes(this.actionsDevicesForm.value.search.toLowerCase());
      });
    }
    if (this.dontShowHiddenDevices) {
      this.filteredDevices = this.filteredDevices.filter(device => !device.hided)
    }
  }

  toggleHiddenDevices() {
    this.dontShowHiddenDevices = !this.dontShowHiddenDevices;
    this.filterDevices();
  }

  filterGroups() {
    this.filteredGroups = this.groups.filter((group) => {
      return group.teamName
        .toLowerCase()
        .includes(this.actionsGroupsForm.value.search.toLowerCase());
    });
    if (this.dontShowHiddenGroups) {
      this.filteredGroups = this.filteredGroups.filter(group => !group.hided)
    }
  }

  toggleHiddenGroups() {
    this.dontShowHiddenGroups = !this.dontShowHiddenGroups;
    this.filterGroups();
  }

  filterCollaborators() {
    this.filteredCollaborators = this.collaborators.filter((collaborator) => {
      return (
        // TODO: Retomar cuando tenga datos
        collaborator.nickName
          .toLowerCase()
          .includes(this.actionsCollaboratorsForm.value.search.toLowerCase())
      );
    });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter((user) => {
      return user.nickName
        .toLowerCase()
        .includes(this.actionsUsersForm.value.search.toLowerCase());
    });
  }

  toggleAddProfile() {
    this.showAddProfile = !this.showAddProfile;
  }
  toggleAddDevice() {
    this.showAddDevice = !this.showAddDevice;
  }
  toggleAddGroup() {
    this.showAddGroup = !this.showAddGroup;
  }
  toggleAddCollaborator() {
    this.showAddCollaborator = !this.showAddCollaborator;
  }
  toggleAddUser() {
    this.showAddUser = !this.showAddUser;
  }
}
