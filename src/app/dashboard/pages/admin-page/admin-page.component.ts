import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, mergeMap } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { Profile } from '../../interfaces/profile.interface';
import { Device } from '../../interfaces/device.interface';
import { Group } from '../../interfaces/group.interface';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { User } from '../../interfaces/user.interface';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { Collaborator } from '../../interfaces/collaborator.interface';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { HelpersService } from 'src/app/shared/services/helpers.service';
import { LanguageService } from 'src/app/shared/services/language.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { TimezoneService } from 'src/app/shared/services/timezoneService.service';

import 'moment/locale/es';
import { MessageService } from 'primeng/api';

@Component({
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss'],
  providers: [MessageService],
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
    sex: [null, Validators.required],
    birthplace: ['', Validators.required],
    userID: ['', Validators.required],
    teamID: [{ value: '', disabled: true }],
    device: [false],
    deviceSN: [false],
    hided: [false],
    deviceID: [false],
  });
  public addDeviceForm: FormGroup = this.fb.group({
    serialNumber: ['', [Validators.required, Validators.minLength(6)]],
    verificationCode: ['', [Validators.required, Validators.minLength(5)]],
    userID: ['', Validators.required],
    playerID: [{ value: '', disabled: true }],
    teamID: [''],
    hided: [false],
    offSet: [''],
    player: [''],
    playerName: [''],
  });
  public addGroupForm: FormGroup = this.fb.group({
    teamName: ['', Validators.required],
    gmt: ['', Validators.required],
    userID: ['', Validators.required],
    hided: [false],
  });
  public deleteGroupForm: FormGroup = this.fb.group({
    deleteProfiles: [false],
  });
  public addCollaboratorForm: FormGroup = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.pattern(this.validatorsService.emailPattern),
      ],
    ],
    accessTo: [[]],
    password: [
      '',
      [
        Validators.required,
        Validators.pattern(this.validatorsService.passwordPattern),
      ],
    ],
    confirmPassword: [
      '',
      [
        Validators.required,
        Validators.pattern(this.validatorsService.passwordPattern),
      ],
    ],
    nickName: ['', Validators.required],
    role: ['', Validators.required],
    UID: ['', Validators.required],
  });
  public editCollaboratorForm: FormGroup = this.fb.group({
    email: [''],
    accessTo: [[]],
    password: [''],
    confirmPassword: [''],
    nickName: ['', Validators.required],
    role: ['', Validators.required],
    UID: [''],
    id: [''],
  });
  public addUserForm: FormGroup = this.fb.group({
    id: ['', Validators.required],
    UID: ['', Validators.required],
    email: [
      '',
      Validators.required,
      Validators.pattern(this.validatorsService.emailPattern),
    ],
    nickName: ['', Validators.required],
    role: ['', Validators.required],
    collaborators: [[]],
  });
  public editUserForm: FormGroup = this.fb.group({
    nickName: ['', Validators.required],
    role: ['', Validators.required],
  });
  public filterByUserForm: FormGroup = this.fb.group({
    userId: [''],
  });

  public profiles: Profile[] = [];
  public devices: Device[] = [];
  public groups: Group[] = [];
  public collaborators: Collaborator[] = [];
  public users: User[] = [];

  public profilesByUser: Profile[] = [];
  public devicesByUser: Device[] = [];
  public groupsByUser: Group[] = [];
  public collaboratorsByUser: Collaborator[] = [];

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
  public showConfirmDeleteProfile: boolean = false;
  public showConfirmDeleteDevice: boolean = false;
  public showConfirmDeleteGroup: boolean = false;
  public showConfirmDeleteProfilesByGroup: boolean = false;
  public showConfirmDeleteCollaborator: boolean = false;
  public showConfirmDeleteUser: boolean = false;
  public showAddDevice: boolean = false;
  public showAddGroup: boolean = false;
  public showAddCollaborator: boolean = false;
  public showEditCollaborator: boolean = false;
  public showAddUser: boolean = false;
  public showEditUser: boolean = false;
  public genderItems: ItemDropdown[] = [];
  public usersItems: ItemDropdown[] = [];
  public groupsItemsFilter: ItemDropdown[] = [];
  public groupsItems: ItemDropdown[] = [];
  public profilesItems: ItemDropdown[] = [];
  public countriesItems: ItemDropdown[] = [];
  public gmtItems: ItemDropdown[] = this.helpersService.GMTItems.map(
    (item) => ({
      ...item,
      value: `GMT ${item.value > 0 ? `+${item.value}` : item.value}:00`,
    })
  );
  public roleCollaboratorItems: ItemDropdown[] = [];
  public roleUserItems: ItemDropdown[] = [];

  public userIdProfileToDelete: string = '';
  public profileIdToDelete: string = '';
  public profileIdToEdit?: string;
  public enableEditProfile: boolean = false;

  public userIdDeviceToDelete: string = '';
  public deviceIdToDelete: string = '';
  public deviceIdToEdit?: string;
  public enableEditDevice: boolean = false;

  public userIdGroupToDelete: string = '';
  public groupIdToDelete: string = '';
  public groupIdToEdit?: string;
  public enableEditGroup: boolean = false;

  public userIdToAccessCollaboratorToDelete: string = '';
  public collaboratorIdToDelete: string = '';
  public collaboratorToDelete: Collaborator | null = null;
  public enableEditCollaborator: boolean = false;

  public userToDelete: User | null = null;
  public userIdToDelete: string = '';
  public enableEditUser: boolean = false;

  public userRole: string = '';

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private http: HttpClient,
    private translateService: TranslateService,
    private validatorsService: ValidatorsService,
    private helpersService: HelpersService,
    private languageService: LanguageService,
    private firestore: AngularFirestore,
    private timezoneService: TimezoneService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getCountries();
    this.loadingService.setLoading(true);
    this.authService.checkRole().subscribe((role) => {
      this.userRole = role;
      this.loadData();
    });
    this.languageService.langChanged$.subscribe(() => {
      this.loadTranslations();
    });
    this.loadTranslations();
  }

  // Cargar data
  loadData() {
    if (this.userRole === 'superAdmin') {
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
      .subscribe(async (devices) => {
        const devicesWithStatus = await Promise.all(
          devices.map(async (device: Device) => {
            const status = await this.getStatusDevice(device.id);
            return {
              ...device,
              status,
            };
          })
        );
        this.devices = devicesWithStatus;
        this.filteredDevices = devicesWithStatus;
        this.loadingService.setLoading(false);
      });
  }

  getGroups(userId?: string) {
    this.loadingService.setLoading(true);
    this.databaseService
      .getGroupsByUser(userId || this.authService.userId)
      .subscribe((groups) => {
        this.groups = groups;
        this.groupsItemsFilter = this.groups.map((group) => ({
          label: group.teamName,
          value: group.id,
        }));
        this.filteredGroups = groups;
        this.loadingService.setLoading(false);
      });
  }

  async getCollaborators(userId?: string) {
    this.loadingService.setLoading(true);
    const collaboratorsRef =
      await this.databaseService.getCollaboratorsCollection();
    const collaborators = collaboratorsRef.docs.map((collaborator: any) => {
      const collaboratorData: Collaborator = collaborator.data();
      return {
        ...collaboratorData,
        id: collaborator.id,
        linked: collaboratorData.accessTo
          .map((access) => access.nickName)
          .join(', '),
        userId: collaboratorData.UID,
      };
    });
    this.collaborators = collaborators;
    this.filteredCollaborators = collaborators;
    this.collaboratorsByUser = collaborators;

    this.loadingService.setLoading(false);
  }

  getDataAdmin() {
    this.loadingService.setLoading(true);
    this.databaseService
      .getAllUsers()
      .pipe(
        map((users: User[]) => {
          const filteredUsers = users.filter(
            (user: User) => user.role === 'user' || user.role === 'superAdmin'
          );
          return filteredUsers;
        }),
        mergeMap((users) => {
          this.users = users;
          this.filteredUsers = users;
          this.usersItems = this.users.map((user) => ({
            label: user.nickName,
            value: user.id,
          }));
          const profilesObservables = users.map((user: User) => {
            const profiles$ = this.databaseService.getProfilesByUser(user.id);
            const devices$ = this.databaseService.getDevicesByUser(user.id);
            const groups$ = this.databaseService.getGroupsByUser(user.id);

            return forkJoin([profiles$, devices$, groups$]);
          });

          return forkJoin(profilesObservables);
        })
      )
      .subscribe(async (results: any) => {
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
        const collaboratorsRef =
          await this.databaseService.getCollaboratorsCollection();
        collaborators = collaboratorsRef.docs.map((collaborator: any) => {
          const collaboratorData: Collaborator = collaborator.data();
          return {
            ...collaboratorData,
            id: collaborator.id,
            linked: collaboratorData.accessTo
              .map((access) => access.nickName)
              .join(', '),
            userId: collaboratorData.UID,
          };
        });

        const devicesWithStatus = await Promise.all(
          devices.map(async (device: Device) => {
            const status = await this.getStatusDevice(device.id);
            return {
              ...device,
              status,
            };
          })
        );

        this.profiles = profiles;
        this.profilesByUser = profiles;
        this.filteredProfiles = profiles;
        this.devices = devicesWithStatus;
        this.devicesByUser = devicesWithStatus;
        this.filteredDevices = devicesWithStatus;
        this.groups = groups;
        this.groupsByUser = groups;
        this.filteredGroups = groups;
        this.collaborators = collaborators;
        this.collaboratorsByUser = collaborators;
        this.filteredCollaborators = collaborators;

        this.groupsItemsFilter = this.groups.map((group) => ({
          label: group.teamName,
          value: group.id,
        }));

        this.loadingService.setLoading(false);
      });
  }

  //? FILTRADO Y ACCIONES
  filterProfiles(groupId?: string) {
    if (groupId) {
      this.filteredProfiles = this.profilesByUser.filter((profile) => {
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
      this.filteredProfiles = this.profilesByUser.filter((profile) => {
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
      this.filteredProfiles = this.filteredProfiles.filter(
        (profile) => !profile.hided
      );
    }
  }

  toggleHiddenProfiles() {
    this.dontShowHiddenProfiles = !this.dontShowHiddenProfiles;
    this.filterProfiles();
  }

  filterDevices(groupId?: string) {
    if (groupId) {
      this.filteredDevices = this.devicesByUser.filter((device) => {
        return (
          device.serialNumber
            .toString()
            .toLowerCase()
            .includes(this.actionsDevicesForm.value.search.toLowerCase()) &&
          device.teamID === groupId
        );
      });
    } else {
      this.filteredDevices = this.devicesByUser.filter((device) => {
        return (
          device.serialNumber
            .toLowerCase()
            .includes(this.actionsDevicesForm.value.search.toLowerCase()) ||
          device.playerName
            .toString()
            .toLowerCase()
            .includes(this.actionsDevicesForm.value.search.toLowerCase())
        );
      });
    }
    if (this.dontShowHiddenDevices) {
      this.filteredDevices = this.filteredDevices.filter(
        (device) => !device.hided
      );
    }
  }

  toggleHiddenDevices() {
    this.dontShowHiddenDevices = !this.dontShowHiddenDevices;
    this.filterDevices();
  }

  filterGroups() {
    this.filteredGroups = this.groupsByUser.filter((group) => {
      return group.teamName
        .toLowerCase()
        .includes(this.actionsGroupsForm.value.search.toLowerCase());
    });
    if (this.dontShowHiddenGroups) {
      this.filteredGroups = this.filteredGroups.filter((group) => !group.hided);
    }
  }

  toggleHiddenGroups() {
    this.dontShowHiddenGroups = !this.dontShowHiddenGroups;
    this.filterGroups();
  }

  filterCollaborators() {
    this.filteredCollaborators = this.collaboratorsByUser.filter(
      (collaborator) => {
        return (
          // TODO: Retomar cuando tenga datos
          collaborator.nickName
            .toLowerCase()
            .includes(this.actionsCollaboratorsForm.value.search.toLowerCase())
        );
      }
    );
  }

  filterUsers() {
    this.filteredUsers = this.users.filter((user) => {
      return user.nickName
        .toLowerCase()
        .includes(this.actionsUsersForm.value.search.toLowerCase());
    });
  }

  filterDataByUser(userId?: string) {
    if (!userId) {
      this.profilesByUser = this.profiles;
      this.devicesByUser = this.devices;
      this.groupsByUser = this.groups;
      this.collaboratorsByUser = this.collaborators;

      this.filteredProfiles = this.profilesByUser;
      this.filteredDevices = this.devicesByUser;
      this.filteredGroups = this.groupsByUser;
      this.filteredCollaborators = this.collaboratorsByUser;
    } else {
      this.profilesByUser = this.profiles.filter(
        (profile) => profile.userID === userId
      );
      this.devicesByUser = this.devices.filter(
        (device) => device.userID === userId
      );
      this.groupsByUser = this.groups.filter(
        (group) => group.userID === userId
      );
      this.collaboratorsByUser = this.collaborators.filter((collaborator) => {
        return collaborator.accessTo.some((access) => access.id === userId);
      });

      this.filteredProfiles = this.profilesByUser;
      this.filteredDevices = this.devicesByUser;
      this.filteredGroups = this.groupsByUser;
      this.filteredCollaborators = this.collaboratorsByUser;
    }
  }

  //? MODALES PERFILES
  toggleAddProfile() {
    this.showAddProfile = !this.showAddProfile;

    if (this.userRole !== 'superAdmin') {
      this.selectUserProfile(this.authService.userId);
    }
  }

  toggleEditProfile(profile?: Profile) {
    this.enableEditProfile = !this.enableEditProfile;
    this.showAddProfile = !this.showAddProfile;
    // this.profileIdToEdit = profile?.id || '';

    if (profile) {
      const birthdate = new Date(profile.birthdate.seconds * 1000);

      const newValue = {
        ...profile,
        birthdate,
      };

      this.addProfileForm.patchValue(newValue);
      this.selectUserProfile(
        this.userRole !== 'superAdmin'
          ? this.authService.userId
          : this.addProfileForm.value.userID,
        profile.teamID
      );
    }
  }

  toggleConfirmDeleteProfile(userId?: string, profileId?: string) {
    if (userId && profileId) {
      this.userIdProfileToDelete = userId;
      this.profileIdToDelete = profileId;
    }

    this.showConfirmDeleteProfile = !this.showConfirmDeleteProfile;
  }

  //? MODALES DISPOSITIVOS
  toggleAddDevice() {
    this.showAddDevice = !this.showAddDevice;

    if (this.userRole !== 'superAdmin') {
      this.selectUserDevice(this.authService.userId);
    }
  }

  toggleEditDevice(device?: Device) {
    this.enableEditDevice = !this.enableEditDevice;
    this.showAddDevice = !this.showAddDevice;
    this.deviceIdToEdit = device?.id || '';

    if (device) {
      this.addDeviceForm.patchValue(device);
      this.selectUserDevice(
        this.userRole !== 'superAdmin'
          ? this.authService.userId
          : this.addDeviceForm.value.userID,
        device.playerID.toString()
      );
    }
  }

  toggleConfirmDeleteDevice(userId?: string, deviceId?: string) {
    if (userId && deviceId) {
      this.userIdDeviceToDelete = userId;
      this.deviceIdToDelete = deviceId;
    }

    this.showConfirmDeleteDevice = !this.showConfirmDeleteDevice;
  }

  //? MODALES GRUPOS
  toggleAddGroup() {
    this.showAddGroup = !this.showAddGroup;
  }

  toggleEditGroup(group?: Group) {
    this.enableEditGroup = !this.enableEditGroup;
    this.showAddGroup = !this.showAddGroup;

    if (group) {
      this.addGroupForm.patchValue(group);
      this.addGroupForm.patchValue({
        userID: group.userID,
      });
    }
  }

  toggleConfirmDeleteGroup(userId?: string, groupId?: string) {
    if (userId && groupId) {
      this.userIdGroupToDelete = userId;
      this.groupIdToDelete = groupId;
    }

    this.showConfirmDeleteGroup = !this.showConfirmDeleteGroup;
  }

  toggleConfirmDeleteProfilesGroup(cancel?: boolean) {
    if (cancel) {
      this.deleteGroupForm.patchValue({
        deleteProfiles: false,
      });
    }

    this.showConfirmDeleteProfilesByGroup =
      !this.showConfirmDeleteProfilesByGroup;
  }

  //? MODALES COLABORADORES
  toggleAddCollaborator() {
    this.showAddCollaborator = !this.showAddCollaborator;
  }

  toggleEditCollaborator(collaborator?: Collaborator) {
    this.showEditCollaborator = !this.showEditCollaborator;

    if (collaborator) {
      this.editCollaboratorForm.patchValue(collaborator);
    }
  }

  toggleConfirmDeleteCollaborator(
    collaborator?: Collaborator,
    userIdAccessTo?: string,
    collaboratorId?: string
  ) {
    if (collaborator && userIdAccessTo && collaboratorId) {
      this.collaboratorToDelete = collaborator;
      this.userIdToAccessCollaboratorToDelete = userIdAccessTo;
      this.collaboratorIdToDelete = collaboratorId;
    }

    this.showConfirmDeleteCollaborator = !this.showConfirmDeleteCollaborator;
  }

  //? MODALES USUARIOS
  toggleAddUser() {
    this.showAddUser = !this.showAddUser;
  }

  toggleEditUser(user?: User) {
    this.showEditUser = !this.showEditUser;

    if (user) {
      this.editUserForm.patchValue(user);
    }
  }

  toggleConfirmDeleteUser(user?: User) {
    if (user) {
      this.userToDelete = user;
    }

    this.showConfirmDeleteUser = !this.showConfirmDeleteUser;
  }

  //? ACCIONES PERFILES
  addProfile() {
    if (this.addProfileForm.status !== 'INVALID') {
      // const profileRef = this.firestore.collection(
      //   `/users/nyxsys/content/${
      //     this.userRole === 'superAdmin'
      //       ? this.addProfileForm.value.userID
      //       : this.authService.userId
      //   }/players`
      // );

      // this.loadingService.setLoading(true);
      // profileRef
      //   .add({
      //     ...this.addProfileForm.value,
      //   })
      //   .then(() => {
      //     this.toggleAddProfile();
      //     this.messageService.add({
      //       severity: 'success',
      //       summary: this.translateService.instant('ToastTitleCorrect'),
      //       detail: this.translateService.instant('adminAddProfileSuccess'),
      //     });
      //     this.loadData();
      //   })
      //   .catch(() => {
      //     this.loadingService.setLoading(false);
      //     this.messageService.add({
      //       severity: 'error',
      //       summary: this.translateService.instant('ToastTitleError'),
      //       detail: this.translateService.instant('adminAddProfileError'),
      //     });
      //   });
      this.loadingService.setLoading(true);
      this.databaseService
        .addProfile(this.addProfileForm.value)
        .then(() => {
          this.toggleAddProfile();
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('ToastTitleCorrect'),
            detail: this.translateService.instant('adminAddProfileSuccess'),
          });
          this.loadData();
        })
        .catch(() => {
          this.loadingService.setLoading(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ToastTitleError'),
            detail: this.translateService.instant('adminAddProfileError'),
          });
        });
    }
  }

  editProfile() {
    if (this.addProfileForm.status !== 'INVALID') {
      // const profileRef = this.firestore.doc(
      //   `/users/nyxsys/content/${
      //     this.userRole === 'superAdmin'
      //       ? this.addProfileForm.value.userID
      //       : this.authService.userId
      //   }/players/${this.profileIdToEdit}`
      // );

      // this.loadingService.setLoading(true);
      // profileRef
      //   .set(
      //     {
      //       ...this.addProfileForm.value,
      //     },
      //     { merge: true }
      //   )
      //   .then(() => {
      //     this.toggleEditProfile();
      //     this.actionsProfilesForm.reset();
      //     this.messageService.add({
      //       severity: 'success',
      //       summary: this.translateService.instant('ToastTitleCorrect'),
      //       detail: this.translateService.instant('adminEditProfileSuccess'),
      //     });
      //     this.profileIdToEdit = '';
      //     this.loadData();
      //   })
      //   .catch(() => {
      //     this.loadingService.setLoading(false);
      //     this.messageService.add({
      //       severity: 'error',
      //       summary: this.translateService.instant('ToastTitleError'),
      //       detail: this.translateService.instant('adminEditProfileError'),
      //     });
      //   });
      this.databaseService
        .editProfile(this.addProfileForm.value)
        .then(() => {
          this.toggleEditProfile();
          this.actionsProfilesForm.reset();
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('ToastTitleCorrect'),
            detail: this.translateService.instant('adminEditProfileSuccess'),
          });
          this.loadData();
        })
        .catch(() => {
          this.loadingService.setLoading(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ToastTitleError'),
            detail: this.translateService.instant('adminEditProfileError'),
          });
        });
    }
  }

  addOrEditProfile() {
    if (this.enableEditProfile) {
      this.editProfile();
    } else {
      this.addProfile();
    }
  }

  onCloseModalProfile() {
    this.addProfileForm.reset();
    this.addProfileForm?.get('sex')?.setErrors(null);
    this.addProfileForm?.get('userID')?.setErrors(null);
    this.addProfileForm?.get('teamID')?.setErrors(null);

    this.enableEditProfile = false;
    this.showAddProfile = false;
  }

  deleteProfile() {
    // const profileRef = this.firestore.doc(
    //   `/users/nyxsys/content/${this.userIdProfileToDelete}/players/${this.profileIdToDelete}`
    // );

    // this.userIdProfileToDelete = '';
    // this.profileIdToDelete = '';

    // this.loadingService.setLoading(true);
    // profileRef
    // .delete()
    // .then(() => {
    //     this.toggleConfirmDeleteProfile();
    //     this.actionsProfilesForm.reset();
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: this.translateService.instant('ToastTitleCorrect'),
    //       detail: this.translateService.instant('adminDeleteProfileSuccess'),
    //     });
    //     this.loadData();
    //   })
    //   .catch(() => {
    //     this.loadingService.setLoading(false);
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: this.translateService.instant('ToastTitleError'),
    //       detail: this.translateService.instant('adminDeleteProfileError'),
    //     });
    //   });
    this.loadingService.setLoading(true);
    this.databaseService
      .deleteProfile(this.profileIdToDelete, this.userIdProfileToDelete)
      .then(() => {
        this.toggleConfirmDeleteProfile();
        this.actionsProfilesForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant('ToastTitleCorrect'),
          detail: this.translateService.instant('adminDeleteProfileSuccess'),
        });
        this.loadData();
      })
      .catch(() => {
        this.loadingService.setLoading(false);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('ToastTitleError'),
          detail: this.translateService.instant('adminDeleteProfileError'),
        });
      });

    this.userIdProfileToDelete = '';
    this.profileIdToDelete = '';
  }

  hideProfile(userIdProfile: string, profileId: string, hideValue: boolean) {
    // const profileRef = this.firestore.doc(
    //   `/users/nyxsys/content/${userIdProfile}/players/${profileId}`
    // );

    // this.loadingService.setLoading(true);
    // profileRef
    //   .update({ hided: !hideValue })
    //   .then(() => {
    //     this.actionsProfilesForm.reset();
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: this.translateService.instant('ToastTitleCorrect'),
    //       detail: this.translateService.instant(
    //         hideValue ? 'adminShowProfileSuccess' : 'adminHideProfileSuccess'
    //       ),
    //     });
    //     this.loadData();
    //   })
    //   .catch(() => {
    //     this.loadingService.setLoading(false);
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: this.translateService.instant('ToastTitleError'),
    //       detail: this.translateService.instant(
    //         hideValue ? 'adminShowProfileError' : 'adminHideProfileError'
    //       ),
    //     });
    //   });
    this.loadingService.setLoading(true);
    this.databaseService
      .hideProfile(userIdProfile, profileId, hideValue)
      .then(() => {
        this.actionsProfilesForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant('ToastTitleCorrect'),
          detail: this.translateService.instant(
            hideValue ? 'adminShowProfileSuccess' : 'adminHideProfileSuccess'
          ),
        });
        this.loadData();
      })
      .catch(() => {
        this.loadingService.setLoading(false);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('ToastTitleError'),
          detail: this.translateService.instant(
            hideValue ? 'adminShowProfileError' : 'adminHideProfileError'
          ),
        });
      });
  }

  //? ACCIONES DISPOSITIVOS
  addDevice() {
    if (this.addDeviceForm.status !== 'INVALID') {
      // const deviceRef = this.firestore.collection(
      //   `/users/nyxsys/content/${
      //     this.userRole === 'superAdmin'
      //       ? this.addDeviceForm.value.userID
      //       : this.authService.userId
      //   }/devices`
      // );

      // this.loadingService.setLoading(true);
      // deviceRef
      //   .add({
      //     ...this.addDeviceForm.value,
      //   })
      //   .then(() => {
      //     this.toggleAddDevice();
      //     this.messageService.add({
      //       severity: 'success',
      //       summary: this.translateService.instant('ToastTitleCorrect'),
      //       detail: this.translateService.instant('adminAddDeviceSuccess'),
      //     });
      //     this.loadData();
      //   })
      //   .catch(() => {
      //     this.loadingService.setLoading(false);
      //     this.messageService.add({
      //       severity: 'error',
      //       summary: this.translateService.instant('ToastTitleError'),
      //       detail: this.translateService.instant('adminAddDeviceError'),
      //     });
      //   });
      this.loadingService.setLoading(true);
      this.databaseService
        .addDevice(this.addDeviceForm.value)
        .then(() => {
          this.toggleAddDevice();
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('ToastTitleCorrect'),
            detail: this.translateService.instant('adminAddDeviceSuccess'),
          });
          this.loadData();
        })
        .catch(() => {
          this.loadingService.setLoading(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ToastTitleError'),
            detail: this.translateService.instant('adminAddDeviceError'),
          });
        });
    }
  }

  editDevice() {
    if (this.addDeviceForm.status !== 'INVALID') {
      // const deviceRef = this.firestore.doc(
      //   `/users/nyxsys/content/${
      //     this.userRole === 'superAdmin'
      //       ? this.addDeviceForm.value.userID
      //       : this.authService.userId
      //   }/devices/${this.deviceIdToEdit}`
      // );

      // this.loadingService.setLoading(true);
      // deviceRef
      //   .set(
      //     {
      //       ...this.addDeviceForm.value,
      //     },
      //     { merge: true }
      //   )
      //   .then(() => {
      //     this.toggleEditDevice();
      //     this.actionsDevicesForm.reset();
      //     this.messageService.add({
      //       severity: 'success',
      //       summary: this.translateService.instant('ToastTitleCorrect'),
      //       detail: this.translateService.instant('adminEditDeviceSuccess'),
      //     });
      //     this.deviceIdToEdit = '';
      //     this.loadData();
      //   })
      //   .catch(() => {
      //     this.loadingService.setLoading(false);
      //     this.messageService.add({
      //       severity: 'error',
      //       summary: this.translateService.instant('ToastTitleError'),
      //       detail: this.translateService.instant('adminEditDeviceError'),
      //     });
      //   });
      this.loadingService.setLoading(true);
      this.databaseService
        .editDevice(this.addDeviceForm.value)
        .then(() => {
          this.toggleEditDevice();
          this.actionsDevicesForm.reset();
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('ToastTitleCorrect'),
            detail: this.translateService.instant('adminEditDeviceSuccess'),
          });
          this.deviceIdToEdit = '';
          this.loadData();
        })
        .catch(() => {
          this.loadingService.setLoading(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ToastTitleError'),
            detail: this.translateService.instant('adminEditDeviceError'),
          });
        });
    }
  }

  addOrEditDevice() {
    if (this.enableEditDevice) {
      this.editDevice();
    } else {
      this.addDevice();
    }
  }

  onCloseModalDevice() {
    this.addDeviceForm.reset();

    this.enableEditDevice = false;
    this.showAddDevice = false;
  }

  deleteDevice() {
    // const deviceRef = this.firestore.doc(
    //   `/users/nyxsys/content/${this.userIdDeviceToDelete}/devices/${this.deviceIdToDelete}`
    // );

    // this.toggleConfirmDeleteDevice();

    // this.userIdDeviceToDelete = '';
    // this.deviceIdToDelete = '';

    // this.loadingService.setLoading(true);
    // deviceRef
    //   .delete()
    //   .then(() => {
    //     this.actionsDevicesForm.reset();
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: this.translateService.instant('ToastTitleCorrect'),
    //       detail: this.translateService.instant('adminDeleteDeviceSuccess'),
    //     });
    //     this.loadData();
    //   })
    //   .catch(() => {
    //     this.loadingService.setLoading(false);
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: this.translateService.instant('ToastTitleError'),
    //       detail: this.translateService.instant('adminDeleteDeviceError'),
    //     });
    //   });
    this.toggleConfirmDeleteDevice();

    this.loadingService.setLoading(true);
    this.databaseService
      .deleteDevice(this.deviceIdToDelete, this.userIdDeviceToDelete)
      .then(() => {
        this.actionsDevicesForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant('ToastTitleCorrect'),
          detail: this.translateService.instant('adminDeleteDeviceSuccess'),
        });
        this.loadData();
      })
      .catch(() => {
        this.loadingService.setLoading(false);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('ToastTitleError'),
          detail: this.translateService.instant('adminDeleteDeviceError'),
        });
      });

    this.userIdDeviceToDelete = '';
    this.deviceIdToDelete = '';
  }

  //? ACCIONES GRUPOS
  addGroup() {
    if (this.addGroupForm.status !== 'INVALID') {
      // const groupRef = this.firestore.collection(
      //   `/users/nyxsys/content/${
      //     this.userRole === 'superAdmin'
      //       ? this.addGroupForm.value.userID
      //       : this.authService.userId
      //   }/teams`
      // );

      // this.toggleAddGroup();
      // this.loadingService.setLoading(true);
      // groupRef
      //   .add({
      //     ...this.addGroupForm.value,
      //   })
      //   .then(() => {
      //     this.messageService.add({
      //       severity: 'success',
      //       summary: this.translateService.instant('ToastTitleCorrect'),
      //       detail: this.translateService.instant('adminAddGroupSuccess'),
      //     });
      //     this.loadData();
      //   })
      //   .catch(() => {
      //     this.loadingService.setLoading(false);
      //     this.messageService.add({
      //       severity: 'error',
      //       summary: this.translateService.instant('ToastTitleError'),
      //       detail: this.translateService.instant('adminAddGroupError'),
      //     });
      //   });
      this.loadingService.setLoading(true);
      this.databaseService
        .addGroup(this.addGroupForm.value)
        .then(() => {
          this.toggleAddGroup();
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('ToastTitleCorrect'),
            detail: this.translateService.instant('adminAddGroupSuccess'),
          });
          this.loadData();
        })
        .catch(() => {
          this.loadingService.setLoading(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ToastTitleError'),
            detail: this.translateService.instant('adminAddGroupError'),
          });
        });
    }
  }

  editGroup() {
    if (this.addGroupForm.status !== 'INVALID') {
      // const groupRef = this.firestore.doc(
      //   `/users/nyxsys/content/${
      //     this.userRole === 'superAdmin'
      //       ? this.addGroupForm.value.userID
      //       : this.authService.userId
      //   }/teams/${this.groupIdToEdit}`
      // );

      // this.loadingService.setLoading(true);
      // groupRef
      //   .set(
      //     {
      //       ...this.addGroupForm.value,
      //     },
      //     { merge: true }
      //   )
      //   .then(() => {
      //     this.toggleEditGroup();
      //     this.actionsGroupsForm.reset();
      //     this.messageService.add({
      //       severity: 'success',
      //       summary: this.translateService.instant('ToastTitleCorrect'),
      //       detail: this.translateService.instant('adminEditGroupSuccess'),
      //     });
      //     this.groupIdToEdit = '';
      //     this.loadData();
      //   })
      //   .catch(() => {
      //     this.loadingService.setLoading(false);
      //     this.messageService.add({
      //       severity: 'error',
      //       summary: this.translateService.instant('ToastTitleError'),
      //       detail: this.translateService.instant('adminEditGroupError'),
      //     });
      //   });
      this.loadingService.setLoading(true);
      this.databaseService
        .editGroup(this.addGroupForm.value)
        .then(() => {
          this.toggleEditGroup();
          this.actionsGroupsForm.reset();
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('ToastTitleCorrect'),
            detail: this.translateService.instant('adminEditGroupSuccess'),
          });
          this.loadData();
        })
        .catch(() => {
          this.loadingService.setLoading(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ToastTitleError'),
            detail: this.translateService.instant('adminEditGroupError'),
          });
        });
    }
  }

  addOrEditGroup() {
    if (this.enableEditGroup) {
      this.editGroup();
    } else {
      this.addGroup();
    }
  }

  onCloseModalGroup() {
    this.addGroupForm.reset();

    this.enableEditGroup = false;
    this.showAddGroup = false;
  }

  deleteGroup() {
    // const groupRef = this.firestore.doc(
    //   `/users/nyxsys/content/${this.userIdGroupToDelete}/teams/${this.groupIdToDelete}`
    // );

    // this.userIdGroupToDelete = '';
    // this.groupIdToDelete = '';

    // this.toggleConfirmDeleteGroup();
    // this.loadingService.setLoading(true);
    // groupRef
    //   .delete()
    //   .then(() => {
    //     this.actionsGroupsForm.reset();
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: this.translateService.instant('ToastTitleCorrect'),
    //       detail: this.translateService.instant('adminDeleteGroupSuccess'),
    //     });
    //     this.loadData();
    //   })
    //   .catch(() => {
    //     this.loadingService.setLoading(false);
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: this.translateService.instant('ToastTitleError'),
    //       detail: this.translateService.instant('adminDeleteGroupError'),
    //     });
    //   });
    this.toggleConfirmDeleteGroup();

    this.loadingService.setLoading(true);
    this.databaseService
      .deleteGroup(
        this.groupIdToDelete,
        this.userIdGroupToDelete,
        this.deleteGroupForm.value.deleteProfiles
      )
      .then(() => {
        this.actionsGroupsForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant('ToastTitleCorrect'),
          detail: this.translateService.instant('adminDeleteGroupSuccess'),
        });
        this.loadData();
      })
      .catch(() => {
        this.loadingService.setLoading(false);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('ToastTitleError'),
          detail: this.translateService.instant('adminDeleteGroupError'),
        });
      });

    this.userIdGroupToDelete = '';
    this.groupIdToDelete = '';
  }

  hideGroup(userIdGroup: string, groupId: string, hideValue: boolean) {
    // const groupRef = this.firestore.doc(
    //   `/users/nyxsys/content/${userIdGroup}/teams/${groupId}`
    // );

    // this.loadingService.setLoading(true);
    // groupRef
    //   .update({ hided: !hideValue })
    //   .then(() => {
    //     this.actionsGroupsForm.reset();
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: this.translateService.instant('ToastTitleCorrect'),
    //       detail: this.translateService.instant(
    //         hideValue ? 'adminShowGroupSuccess' : 'adminHideGroupSuccess'
    //       ),
    //     });
    //     this.loadData();
    //   })
    //   .catch(() => {
    //     this.loadingService.setLoading(false);
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: this.translateService.instant('ToastTitleError'),
    //       detail: this.translateService.instant(
    //         hideValue ? 'adminShowGroupError' : 'adminHideGroupError'
    //       ),
    //     });
    //   });
    this.loadingService.setLoading(true);

    this.databaseService
      .hideGroup(userIdGroup, groupId, hideValue)
      .then(() => {
        this.actionsGroupsForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant('ToastTitleCorrect'),
          detail: this.translateService.instant(
            hideValue ? 'adminShowGroupSuccess' : 'adminHideGroupSuccess'
          ),
        });
        this.loadData();
      })
      .catch(() => {
        this.loadingService.setLoading(false);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('ToastTitleError'),
          detail: this.translateService.instant(
            hideValue ? 'adminShowGroupError' : 'adminHideGroupError'
          ),
        });
      });
  }

  //? ACCIONES COLABORADORES
  addCollaborator() {
    // try {
    //   if (this.addCollaboratorForm.status !== 'INVALID') {
    //     let userId = '';

    //     if (this.userRole === 'superAdmin') {
    //       userId = this.addCollaboratorForm.value.UID;
    //     } else {
    //       userId = this.authService.currentUser;
    //     }

    //     const userAccess: User | undefined = this.users.find((user) => {
    //       return user.id === userId;
    //     });

    //     const accessTo = [
    //       {
    //         email: userAccess?.email,
    //         id: userAccess?.id,
    //         nickName: userAccess?.nickName,
    //       },
    //     ];

    //     this.loadingService.setLoading(true);
    //     await this.authService.registerCollaborator(
    //       this.addCollaboratorForm.value.email,
    //       this.addCollaboratorForm.value.password,
    //       this.addCollaboratorForm.value.nickName,
    //       this.addCollaboratorForm.value.role,
    //       accessTo
    //     );
    //     this.toggleAddCollaborator();
    //     this.loadingService.setLoading(false);
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: this.translateService.instant('ToastTitleCorrect'),
    //       detail: this.translateService.instant('adminAddCollaboratorSuccess'),
    //     });
    //     this.loadData();
    //   }
    // } catch (error) {
    //   this.loadingService.setLoading(false);
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: this.translateService.instant('ToastTitleError'),
    //     detail: this.translateService.instant('adminAddCollaboratorError'),
    //   });
    // }
    this.loadingService.setLoading(true);

    this.databaseService
      .addCollaborator(this.addCollaboratorForm.value, this.users)
      .then(() => {
        this.toggleAddCollaborator();
        this.loadingService.setLoading(false);
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant('ToastTitleCorrect'),
          detail: this.translateService.instant('adminAddCollaboratorSuccess'),
        });
        this.loadData();
      })
      .catch(() => {
        this.loadingService.setLoading(false);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('ToastTitleError'),
          detail: this.translateService.instant('adminAddCollaboratorError'),
        });
      });
  }

  editCollaborator() {
    if (this.editCollaboratorForm.status !== 'INVALID') {
      this.loadingService.setLoading(true);
      this.databaseService
        .editCollaborator(this.editCollaboratorForm.value, this.users)
        .then(() => {
          this.toggleEditCollaborator();
          this.actionsCollaboratorsForm.reset();
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('ToastTitleCorrect'),
            detail: this.translateService.instant(
              'adminEditCollaboratorSuccess'
            ),
          });
          this.loadData();
        })
        .catch(() => {
          this.loadingService.setLoading(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ToastTitleError'),
            detail: this.translateService.instant('adminEditCollaboratorError'),
          });
        });
    }
  }

  addOrEditCollaborator() {
    if (this.enableEditCollaborator) {
      this.editCollaborator();
    } else {
      this.addCollaborator();
    }
  }

  onCloseModalAddCollaborator() {
    this.addCollaboratorForm.reset();

    this.showAddCollaborator = false;
  }

  onCloseModalEditCollaborator() {
    this.editCollaboratorForm.reset();

    this.showEditCollaborator = false;
  }

  deleteCollaborator() {
    // try {
    //   const collaboratorRef = this.firestore.doc(
    //     `/users/nyxsys/content/${this.collaboratorIdToDelete}`
    //   );

    //   const userAccessRef = this.firestore.doc(
    //     `/users/nyxsys/content/${this.userIdToAccessCollaboratorToDelete}`
    //   );

    //   this.toggleConfirmDeleteCollaborator();
    //   this.loadingService.setLoading(true);
    //   await collaboratorRef.delete();

    //   const userToAccess = this.users.find(
    //     (user: User) => user.id === this.userIdToAccessCollaboratorToDelete
    //   );
    //   const newCollaboratorsUserToAccess = userToAccess?.collaborators.filter(
    //     (collaborator: Collaborator) =>
    //       collaborator.id !== this.collaboratorIdToDelete
    //   );

    //   await userAccessRef.update({
    //     collaborators: newCollaboratorsUserToAccess,
    //   });

    //   this.authService.deleteUser(this.collaboratorToDelete);
    //   this.collaboratorToDelete = null;
    //   this.collaboratorIdToDelete = '';
    //   this.userIdToAccessCollaboratorToDelete = '';
    //   this.actionsCollaboratorsForm.reset();
    //   this.messageService.add({
    //     severity: 'success',
    //     summary: this.translateService.instant('ToastTitleCorrect'),
    //     detail: this.translateService.instant('adminDeleteCollaboratorSuccess'),
    //   });
    //   this.loadData();
    // } catch (error) {
    //   this.loadingService.setLoading(false);
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: this.translateService.instant('ToastTitleError'),
    //     detail: this.translateService.instant('adminDeleteCollaboratorError'),
    //   });
    // }
    this.toggleConfirmDeleteCollaborator();

    this.loadingService.setLoading(true);
    this.databaseService
      .deleteCollaborator(
        this.collaboratorIdToDelete,
        this.userIdToAccessCollaboratorToDelete,
        this.collaboratorToDelete,
        this.users
      )
      .then(() => {
        this.actionsCollaboratorsForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant('ToastTitleCorrect'),
          detail: this.translateService.instant(
            'adminDeleteCollaboratorSuccess'
          ),
        });
        this.loadData();
      })
      .catch(() => {
        this.loadingService.setLoading(false);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('ToastTitleError'),
          detail: this.translateService.instant('adminDeleteCollaboratorError'),
        });
      });
    this.collaboratorToDelete = null;
    this.collaboratorIdToDelete = '';
    this.userIdToAccessCollaboratorToDelete = '';
  }

  //? ACCIONES USUARIOS
  addUser() {
    if (this.addUserForm.status !== 'INVALID') {
      this.loadingService.setLoading(true);

      this.databaseService
        .addUser(this.addUserForm.value)
        .then(() => {
          this.toggleAddUser();
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('ToastTitleCorrect'),
            detail: this.translateService.instant('adminAddUserSuccess'),
          });
          this.loadData();
        })
        .catch(() => {
          this.loadingService.setLoading(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ToastTitleError'),
            detail: this.translateService.instant('adminAddUserError'),
          });
        });
    }
  }

  editUser() {
    if (this.editUserForm.status !== 'INVALID') {
      this.loadingService.setLoading(true);

      this.databaseService
        .editUser(this.editUserForm.value)
        .then(() => {
          this.toggleEditUser();
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('ToastTitleCorrect'),
            detail: this.translateService.instant('adminEditUserSuccess'),
          });
          this.loadData();
        })
        .catch(() => {
          this.loadingService.setLoading(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ToastTitleError'),
            detail: this.translateService.instant('adminEditUserError'),
          });
        });
    }
  }

  onCloseModalAddUser() {
    this.addUserForm.reset();

    this.showAddUser = false;
  }

  onCloseModalEditUser() {
    this.editUserForm.reset();

    this.showEditUser = false;
  }

  deleteUser() {
    this.loadingService.setLoading(true);
    this.databaseService
      .deleteUser(this.userToDelete)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant('ToastTitleCorrect'),
          detail: this.translateService.instant('adminDeleteUserSuccess'),
        });
        this.loadData();
      })
      .catch(() => {
        this.loadingService.setLoading(false);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('ToastTitleError'),
          detail: this.translateService.instant('adminDeleteUserError'),
        });
      });
  }

  //? HELPERS
  private getCountries(): void {
    const url = 'https://restcountries.com/v3.1/all';

    this.http.get<any[]>(url).subscribe(
      (countries) => {
        this.countriesItems = countries.map((country) => {
          let formattedCountry = {
            label: '',
            value: {
              alpha2Code: '',
              alpha3Code: '',
              callingCode: '',
              name: '',
              numericCode: '',
            },
            img: '',
          };

          if (this.translateService.currentLang === 'es') {
            formattedCountry = {
              label: country.translations.spa.common,
              value: {
                alpha2Code: country.cca2,
                alpha3Code: country.cca3,
                callingCode: `${country.idd.root}${country.idd.suffixes}`,
                name: country.name.common,
                numericCode: country.ccn3,
              },
              img: country.flags.svg || country.flags.png,
            };
          } else if (this.translateService.currentLang === 'en') {
            formattedCountry = {
              label: country.name.common,
              value: {
                alpha2Code: country.cca2,
                alpha3Code: country.cca3,
                callingCode: `${country.idd.root}${country.idd.suffixes}`,
                name: country.name.common,
                numericCode: country.ccn3,
              },
              img: country.flags.svg || country.flags.png,
            };
          } else if (this.translateService.currentLang === 'it') {
            formattedCountry = {
              label: country.translations.ita.common,
              value: {
                alpha2Code: country.cca2,
                alpha3Code: country.cca3,
                callingCode: `${country.idd.root}${country.idd.suffixes}`,
                name: country.name.common,
                numericCode: country.ccn3,
              },
              img: country.flags.svg || country.flags.png,
            };
          } else if (this.translateService.currentLang === 'de') {
            formattedCountry = {
              label: country.translations.deu.common,
              value: {
                alpha2Code: country.cca2,
                alpha3Code: country.cca3,
                callingCode: `${country.idd.root}${country.idd.suffixes}`,
                name: country.name.common,
                numericCode: country.ccn3,
              },
              img: country.flags.svg || country.flags.png,
            };
          } else if (this.translateService.currentLang === 'fr') {
            formattedCountry = {
              label: country.translations.fra.common,
              value: {
                alpha2Code: country.cca2,
                alpha3Code: country.cca3,
                callingCode: `${country.idd.root}${country.idd.suffixes}`,
                name: country.name.common,
                numericCode: country.ccn3,
              },
              img: country.flags.svg || country.flags.png,
            };
          }
          return formattedCountry;
        });
        this.countriesItems = this.countriesItems.sort((a, b) =>
          a.label.localeCompare(b.label)
        );
      },
      (error) => {
        console.error('Error al obtener la lista de países:', error);
      }
    );
  }

  private getStatusDevice(deviceId: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const liveDataSnapshot =
          await this.databaseService.getLiveDataCollection(deviceId);
        const liveData: any[] = liveDataSnapshot.docs.map((doc) => doc.data());

        const onlineCondition =
          liveData.filter((data: any) => data.activity === 0).length >= 2;
        const activityCondition =
          liveData.filter((data: any) => data.activity !== 0).length >= 2;

        let status: 'Offline' | 'Online' | 'En actividad' = 'Offline';

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
          status = 'Offline';
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
          status = 'Online';
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
          status = 'En actividad';
        } else {
          status = 'Offline';
        }
        resolve(status);
      } catch (error) {
        reject(error);
      }
    });
  }

  private loadTranslations() {
    this.languageService
      .getTranslate('adminModalGenderItems')
      .subscribe((translations: any) => {
        this.genderItems = translations;
      });
    this.languageService
      .getTranslate('adminModalRoleCollaboratorItems')
      .subscribe((translations: any) => {
        this.roleCollaboratorItems = translations;
      });
    this.languageService
      .getTranslate('adminModalRoleUserItems')
      .subscribe((translations: any) => {
        this.roleUserItems = translations;
      });
  }

  selectUserProfile(userId: string, teamId?: string) {
    this.addProfileForm.controls['teamID'].reset({
      value: teamId || '',
      disabled: false,
    });
    this.addProfileForm.patchValue({
      userID: userId,
    });
    this.groupsItems = this.groups
      .filter((group) => group.userID === userId)
      .map((group: Group) => ({
        label: group.teamName,
        value: group.id,
      }));
  }

  selectUserDevice(userId: string, profileId?: string) {
    this.addDeviceForm.controls['playerID'].reset({
      value: profileId || '',
      disabled: false,
    });
    this.addDeviceForm.patchValue({
      userID: userId,
    });
    this.profilesItems = this.profiles
      .filter((profile) => profile.userID === userId)
      .map((profile: Profile) => ({
        label: `${profile.name} ${profile.lastName}`,
        value: profile.id,
      }));
  }

  validateInputs(form: FormGroup, field: string): string {
    const errors = form.controls[field].errors;
    const touched = form.controls[field].touched;
    if (errors && touched) {
      if (errors['required']) {
        return this.translateService.instant('settingsMandatoryFieldError');
      }
      if (errors['pattern']) {
        return this.translateService.instant('settingsValidEmailError');
      }
      if (errors['existDevice']) {
        return this.translateService.instant('adminExistDeviceError');
      }
      if (errors['existEmail']) {
        return this.translateService.instant('adminExistEmailError');
      }
      if (errors['existName']) {
        return this.translateService.instant('adminExistNameError');
      }
      if (errors['minlength'].requiredLength === 5) {
        return this.translateService.instant('adminLength5Characters');
      }
      if (errors['minlength'].requiredLength === 6) {
        return this.translateService.instant('adminLength6Characters');
      }
    }
    return '';
  }

  validateDeviceSerialNumber(value: string) {
    if (value.length >= 6) {
      const existDevice = this.devices.some(
        (device) => device.serialNumber.toLowerCase() === value.toLowerCase()
      );
      if (existDevice) {
        this.addDeviceForm.controls['serialNumber'].setErrors({
          existDevice: true,
        });
      }
    }
  }

  validateGroupName(value: string) {
    const existGroupName = this.groups.some(
      (group) => group.teamName.toLowerCase() === value.toLowerCase()
    );
    if (existGroupName) {
      this.addGroupForm.controls['teamName'].setErrors({
        existName: true,
      });
    }
  }

  validateEmailCollaborator(value: string) {
    const existEmail = this.collaborators.some(
      (collaborator) => collaborator.email.toLowerCase() === value.toLowerCase()
    );
    if (existEmail) {
      this.addCollaboratorForm.controls['email'].setErrors({
        existEmail: true,
      });
    }
  }

  validateEmailUser(value: string) {
    const existEmail = this.users.some(
      (user) => user.email.toLowerCase() === value.toLowerCase()
    );
    if (existEmail) {
      this.addUserForm.controls['email'].setErrors({
        existEmail: true,
      });
    }
  }
}
