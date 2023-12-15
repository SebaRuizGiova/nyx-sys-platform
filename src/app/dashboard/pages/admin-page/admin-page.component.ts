import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/auth/services/auth.service';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { Profile } from '../../interfaces/profile.interface';
import { Device } from '../../interfaces/device.interface';
import { Group } from '../../interfaces/group.interface';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { User } from '../../interfaces/user.interface';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { Collaborator } from '../../interfaces/collaborator.interface';

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

  public profiles: Profile[] = [];
  public devices: Device[] = [];
  public groups: Group[] = [];
  public collaborators: Collaborator[] = [];
  public users: User[] = [];

  public groupsSelect: ItemDropdown[] = [];
  public filteredProfiles: Profile[] = [];
  public filteredDevices: Device[] = [];
  public filteredGroups: Group[] = [];
  public filteredCollaborators: any[] = [];
  public filteredUsers: User[] = [];

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadingService.setLoading(true);
    this.databaseService
      .getProfilesByUser(this.authService.userId)
      .subscribe((profiles) => {
        this.profiles = profiles;
        this.filteredProfiles = profiles;
        this.loadingService.setLoading(false);
      });
    this.loadingService.setLoading(true);
    this.databaseService
      .getDevicesByUser(this.authService.userId)
      .subscribe((devices) => {
        this.devices = devices;
        this.filteredDevices = devices;
        this.loadingService.setLoading(false);
      });
    this.loadingService.setLoading(true);
    this.databaseService
      .getGroupsByUserPaginated(this.authService.userId)
      .subscribe((groups) => {
        this.groups = groups;
        this.groupsSelect = groups.map((group: Group) => ({
          label: group.teamName,
          value: group.id,
        }));
        this.filteredGroups = groups;
        this.loadingService.setLoading(false);
      });
    this.loadingService.setLoading(true);
    this.databaseService
      .getUserData(this.authService.userId)
      .subscribe((user) => {
        this.collaborators = user.collaborators || [];
        this.collaborators[this.collaborators.length - 1];
        this.filteredCollaborators = user.collaborators || [];
      });
    this.loadingService.setLoading(true);
    this.databaseService.getAllUsers().subscribe((users) => {
      this.users = users;
      this.filteredUsers = users;
    });
  }

  // searchProfiles() {
  //   if (this.actionsProfilesForm.value.filterByGroup) {
  //     this.filteredProfiles = this.profiles.filter((profile) => {
  //       return (
  //         profile.name
  //           .toLowerCase()
  //           .includes(this.actionsProfilesForm.value.search.toLowerCase()) ||
  //         profile.lastName
  //           .toLowerCase()
  //           .includes(this.actionsProfilesForm.value.search.toLowerCase())
  //       );
  //     });
  //   }

  // }

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
          profile.lastName
            .toLowerCase()
            .includes(this.actionsProfilesForm.value.search.toLowerCase())
        );
      });
    }
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
  }

  filterGroups() {
    this.filteredGroups = this.groups.filter((group) => {
      return group.teamName
        .toLowerCase()
        .includes(this.actionsGroupsForm.value.search.toLowerCase());
    });
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
}
