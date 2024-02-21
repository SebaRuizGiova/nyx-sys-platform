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
    id: [''],
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    birthdate: ['', Validators.required],
    sex: [null, Validators.required],
    birthplace: ['', Validators.required],
    userID: ['', Validators.required],
    teamID: [{ value: '', disabled: true }],
    device: [false],
    deviceSN: [false],
    deviceID: [false],
    hided: [false],
    deleted: [false],
  });
  public addDeviceForm: FormGroup = this.fb.group({
    id: [''],
    serialNumber: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    verificationCode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
    userID: ['', Validators.required],
    playerID: [{ value: '', disabled: true }],
    teamID: [''],
    hided: [false],
    offSet: [''],
    player: [''],
    playerName: [''],
  });
  public addGroupForm: FormGroup = this.fb.group({
    id: [''],
    teamName: ['', Validators.required],
    gmt: ['', Validators.required],
    userID: ['', Validators.required],
    hided: [false],
    deleted: [false],
  });
  public deleteGroupForm: FormGroup = this.fb.group({
    deleteProfiles: [false],
    deleteDevices: [false],
  });
  public addCollaboratorForm: FormGroup = this.fb.group({
    id: [''],
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
      [
        Validators.required,
        Validators.pattern(this.validatorsService.emailPattern),
      ],
    ],
    nickName: ['', Validators.required],
    role: ['', Validators.required],
    collaborators: [[]],
    deleted: [false],
  });
  public editUserForm: FormGroup = this.fb.group({
    id: [''],
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

  public profileToDelete?: Profile | null;
  public profileIdToEdit?: string;
  public enableEditProfile: boolean = false;

  public userIdDeviceToDelete: string = '';
  public deviceIdToDelete: string = '';
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
        this.profilesByUser = profiles;
        this.filterProfiles();
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
        this.devicesByUser = devicesWithStatus;
        this.filterDevices();
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
        this.groupsByUser = groups;
        this.filterGroups();
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
    const collaboratorsFiltersByUser = collaborators.filter(
      (collaborator) => collaborator.accessTo[0].id === this.authService.userId
    );
    this.collaborators = collaboratorsFiltersByUser;
    this.filteredCollaborators = collaboratorsFiltersByUser;
    this.collaboratorsByUser = collaboratorsFiltersByUser;

    this.filterCollaborators();
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

        this.filterAll();
        this.loadingService.setLoading(false);
      });
  }

  //? FILTRADO Y ACCIONES
  filterProfiles() {
    let filteredProfiles = this.profilesByUser;
    const groupId = this.actionsProfilesForm.value.filterByGroup;

    // Filtrar por grupo si se proporciona el ID del grupo
    if (groupId) {
      filteredProfiles = filteredProfiles.filter((profile) => {
        return profile.teamID === groupId;
      });
    }

    // Filtrar por nombre y apellido
    filteredProfiles = filteredProfiles.filter((profile) => {
      return (
        profile.name
          ?.toLowerCase()
          .includes(this.actionsProfilesForm.value.search?.toLowerCase()) ||
        profile.lastName
          ?.toLowerCase()
          .includes(this.actionsProfilesForm.value.search?.toLowerCase())
      );
    });

    // Filtrar perfiles ocultos si está habilitado el filtro
    if (this.dontShowHiddenProfiles) {
      filteredProfiles = filteredProfiles.filter((profile) => !profile.hided);
    }

    // Asignar los perfiles filtrados al arreglo this.filteredProfiles
    this.filteredProfiles = filteredProfiles;
  }

  toggleHiddenProfiles() {
    this.dontShowHiddenProfiles = !this.dontShowHiddenProfiles;
    this.filterProfiles();
  }

  filterDevices() {
    let filteredDevices = this.devicesByUser;
    const groupId = this.actionsDevicesForm.value.filterByGroup;

    if (groupId) {
      filteredDevices = filteredDevices.filter((device) => {
        return device.teamID === groupId;
      });
    }

    filteredDevices = filteredDevices.filter((device) => {
      return (
        device.serialNumber
          ?.toLowerCase()
          .includes(this.actionsDevicesForm.value.search?.toLowerCase()) ||
        device.playerName
          .toString()
          ?.toLowerCase()
          .includes(this.actionsDevicesForm.value.search?.toLowerCase())
      );
    });

    if (this.dontShowHiddenDevices) {
      filteredDevices = filteredDevices.filter((device) => !device.hided);
    }

    this.filteredDevices = filteredDevices;
  }

  toggleHiddenDevices() {
    this.dontShowHiddenDevices = !this.dontShowHiddenDevices;
    this.filterDevices();
  }

  filterGroups() {
    let filteredGroups = this.groupsByUser;

    filteredGroups = filteredGroups.filter((group) => {
      return group.teamName
        ?.toLowerCase()
        .includes(this.actionsGroupsForm.value.search?.toLowerCase());
    });

    if (this.dontShowHiddenGroups) {
      filteredGroups = filteredGroups.filter((group) => !group.hided);
    }

    this.filteredGroups = filteredGroups;
  }

  toggleHiddenGroups() {
    this.dontShowHiddenGroups = !this.dontShowHiddenGroups;
    this.filterGroups();
  }

  filterCollaborators() {
    let filteredCollaborators = this.collaboratorsByUser;

    filteredCollaborators = filteredCollaborators.filter((collaborator) => {
      return (
        collaborator.nickName
          ?.toLowerCase()
          .includes(this.actionsCollaboratorsForm.value.search?.toLowerCase()) ||
        collaborator.linked
          ?.toLowerCase()
          .includes(this.actionsCollaboratorsForm.value.search?.toLowerCase())
      );
    });

    this.filteredCollaborators = filteredCollaborators;
  }

  filterUsers() {
    let filteredUsers = this.users;

    filteredUsers = filteredUsers.filter((user) => {
      return user.nickName
        ?.toLowerCase()
        .includes(this.actionsUsersForm.value.search?.toLowerCase());
    });

    this.filteredUsers = filteredUsers;
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
  toggleAddProfile(toggle: boolean) {
    this.showAddProfile = toggle;

    if (this.userRole !== 'superAdmin') {
      this.selectUserProfile(this.authService.userId);
    }

    if (!toggle) {
      this.addProfileForm.reset();
      this.addProfileForm.controls['sex'].setErrors(null);
      this.addProfileForm.controls['userID'].setErrors(null);
    }
  }

  toggleEditProfile(profile?: Profile) {
    this.enableEditProfile = !this.enableEditProfile;
    this.showAddProfile = !this.showAddProfile;

    if (profile) {
      const birthdate = new Date(profile.birthdate.seconds * 1000);

      const newValue = {
        ...profile,
        birthdate,
      };

      this.addProfileForm.reset();
      this.addProfileForm.controls['sex'].setErrors(null);
      this.addProfileForm.controls['userID'].setErrors(null);

      this.addProfileForm.patchValue(newValue);
      this.selectUserProfile(
        this.userRole !== 'superAdmin'
          ? this.authService.userId
          : this.addProfileForm.value.userID,
        profile.teamID
      );
    }
  }

  toggleConfirmDeleteProfile(profile?: Profile) {
    if (profile) {
      this.profileToDelete = profile;
    }

    this.showConfirmDeleteProfile = !this.showConfirmDeleteProfile;
  }

  //? MODALES DISPOSITIVOS
  toggleAddDevice(toggle: boolean) {
    this.showAddDevice = toggle;

    if (this.userRole !== 'superAdmin') {
      this.selectUserDevice(this.authService.userId);
    }

    this.addDeviceForm.reset();
    this.addDeviceForm.controls['userID'].setErrors(null);
    this.addDeviceForm?.get('playerID')?.reset({
      value: '',
      disabled: true,
    });
  }

  toggleEditDevice(device?: Device) {
    this.enableEditDevice = !this.enableEditDevice;
    this.showAddDevice = !this.showAddDevice;

    this.addDeviceForm.reset();
    this.addDeviceForm.controls['userID'].setErrors(null);
    this.addDeviceForm?.get('playerID')?.reset({
      value: '',
      disabled: true,
    });

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
  toggleAddGroup(toggle: boolean) {
    this.showAddGroup = toggle;

    if (this.userRole !== 'superAdmin') {
      this.addGroupForm.patchValue({
        userID: this.authService.userId,
      });
    }

    this.addGroupForm.reset();
    this.addGroupForm.controls['gmt'].setErrors(null);
    this.addGroupForm.controls['userID'].setErrors(null);
  }

  toggleEditGroup(group?: Group) {
    this.enableEditGroup = !this.enableEditGroup;
    this.showAddGroup = !this.showAddGroup;

    this.addGroupForm.reset();
    this.addGroupForm.controls['gmt'].setErrors(null);
    this.addGroupForm.controls['userID'].setErrors(null);

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
        deleteDevices: false,
      });
    }

    this.showConfirmDeleteProfilesByGroup =
      !this.showConfirmDeleteProfilesByGroup;
  }

  //? MODALES COLABORADORES
  toggleAddCollaborator(toggle: boolean) {
    this.showAddCollaborator = toggle;

    if (this.userRole !== 'superAdmin') {
      this.addCollaboratorForm.patchValue({
        UID: this.authService.userId,
      });
    }

    this.addCollaboratorForm.reset();
    this.addCollaboratorForm.controls['role'].setErrors(null);
    this.addCollaboratorForm.controls['UID'].setErrors(null);
  }

  toggleEditCollaborator(collaborator?: Collaborator) {
    this.showEditCollaborator = !this.showEditCollaborator;

    this.addCollaboratorForm.reset();
    this.addCollaboratorForm.controls['role'].setErrors(null);
    this.addCollaboratorForm.controls['UID'].setErrors(null);

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
  toggleAddUser(toggle: boolean) {
    this.showAddUser = toggle;

    this.addUserForm.reset();
    this.addUserForm.controls['role'].setErrors(null);
  }

  toggleEditUser(user?: User) {
    this.showEditUser = !this.showEditUser;

    this.addUserForm.reset();
    this.addUserForm.controls['role'].setErrors(null);

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
      this.loadingService.setLoading(true);
      this.databaseService
        .addProfile(this.addProfileForm.value)
        .then(() => {
          this.toggleAddProfile(false);
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
      this.databaseService
        .editProfile(this.addProfileForm.value)
        .then(() => {
          this.toggleEditProfile();
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
    this.addProfileForm.patchValue({
      name: '',
      lastName: '',
      birthdate: '',
      sex: '',
      birthplace: '',
      userID: '',
      teamID: '',
      device: false,
      deviceSN: false,
      hided: false,
      deviceID: false,
    });
    this.addProfileForm?.get('sex')?.setErrors(null);
    this.addProfileForm?.get('userID')?.setErrors(null);
    this.addProfileForm?.get('teamID')?.reset({
      value: '',
      disabled: true,
    });

    this.enableEditProfile = false;
    this.showAddProfile = false;
  }

  deleteProfile() {
    this.loadingService.setLoading(true);
    this.databaseService
      .deleteProfile(this.profileToDelete || null)
      .then(() => {
        this.toggleConfirmDeleteProfile();
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

    this.profileToDelete = null;
  }

  hideProfile(userIdProfile: string, profileId: string, hideValue: boolean) {
    this.loadingService.setLoading(true);
    this.databaseService
      .hideProfile(userIdProfile, profileId, hideValue)
      .then(() => {
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
      this.loadingService.setLoading(true);
      this.databaseService
        .addDevice(this.addDeviceForm.value, this.profiles)
        .then(() => {
          this.toggleAddDevice(false);
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
      this.loadingService.setLoading(true);
      this.databaseService
        .editDevice(this.addDeviceForm.value, this.profiles)
        .then(() => {
          this.toggleEditDevice();
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('ToastTitleCorrect'),
            detail: this.translateService.instant('adminEditDeviceSuccess'),
          });
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
    this.addDeviceForm.patchValue({
      serialNumber: '',
      verificationCode: '',
      userID: '',
      playerID: { value: '', disabled: true },
      teamID: '',
      hided: false,
      offSet: '',
      player: '',
      playerName: '',
    });

    this.enableEditDevice = false;
    this.showAddDevice = false;
  }

  deleteDevice() {
    this.toggleConfirmDeleteDevice();

    this.loadingService.setLoading(true);
    this.databaseService
      .deleteDevice(this.deviceIdToDelete, this.userIdDeviceToDelete)
      .then(() => {
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
      this.loadingService.setLoading(true);
      this.databaseService
        .addGroup(this.addGroupForm.value)
        .then(() => {
          this.toggleAddGroup(false);
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
      this.loadingService.setLoading(true);
      this.databaseService
        .editGroup(this.addGroupForm.value)
        .then(() => {
          this.toggleEditGroup();
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
    this.addGroupForm.patchValue({
      teamName: '',
      gmt: '',
      userID: '',
      hided: false,
    });

    this.enableEditGroup = false;
    this.showAddGroup = false;
  }

  deleteGroup() {
    this.toggleConfirmDeleteGroup();

    this.loadingService.setLoading(true);
    this.databaseService
      .deleteGroup(
        this.groupIdToDelete,
        this.userIdGroupToDelete,
        this.deleteGroupForm.value.deleteProfiles,
        this.deleteGroupForm.value.deleteDevices
      )
      .then(() => {
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
    this.loadingService.setLoading(true);

    this.databaseService
      .hideGroup(userIdGroup, groupId, hideValue)
      .then(() => {
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
    this.loadingService.setLoading(true);

    this.databaseService
      .addCollaborator(this.addCollaboratorForm.value, this.users)
      .then(() => {
        this.toggleAddCollaborator(false);
        this.loadingService.setLoading(false);
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant('ToastTitleCorrect'),
          detail: this.translateService.instant('adminAddCollaboratorSuccess'),
        });
        this.loadData();
      })
      .catch((err) => {
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
    this.addCollaboratorForm.patchValue({
      email: '',
      accessTo: [],
      password: '',
      confirmPassword: '',
      nickName: '',
      role: '',
      UID: '',
    });

    this.showAddCollaborator = false;
  }

  onCloseModalEditCollaborator() {
    this.editCollaboratorForm.patchValue({
      email: '',
      accessTo: [],
      password: '',
      confirmPassword: '',
      nickName: '',
      role: '',
      UID: '',
      id: '',
    });

    this.showEditCollaborator = false;
  }

  deleteCollaborator() {
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
          this.toggleAddUser(false);
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('ToastTitleCorrect'),
            detail: this.translateService.instant('adminAddUserSuccess'),
          });
          this.loadData();
        })
        .catch((error) => {
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
    this.addUserForm.patchValue({
      id: '',
      UID: '',
      email: '',
      nickName: '',
      role: '',
      collaborators: [],
    });

    this.showAddUser = false;
  }

  onCloseModalEditUser() {
    this.editUserForm.patchValue({
      nickName: '',
      role: '',
    });

    this.showEditUser = false;
  }

  deleteUser() {
    this.toggleConfirmDeleteUser();
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

    if (!this.enableEditDevice) {
      this.profilesItems = this.profiles
        .filter(
          (profile) =>
            profile.userID === userId &&
            !this.enableEditDevice &&
            !profile.deviceID
        )
        .map((profile: Profile) => ({
          label: `${profile.name} ${profile.lastName}`,
          value: profile.id,
        }));
    } else {
      this.profilesItems = this.profiles
        .filter((profile) => profile.userID === userId)
        .map((profile: Profile) => ({
          label: `${profile.name} ${profile.lastName}`,
          value: profile.id,
        }));
    }
  }

  selectPlayerLinked(profileId: string) {
    const userLinked = this.profiles.find(
      (profile) => profile.id === profileId
    );

    if (userLinked) {
      this.addDeviceForm.patchValue({
        player: true,
        playerName: `${userLinked.name} ${userLinked.lastName}`,
      });
    }
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
      if (errors['minlength']?.requiredLength === 5) {
        return this.translateService.instant('adminLength5Characters');
      }
      if (errors['minlength']?.requiredLength === 6) {
        return this.translateService.instant('adminLength6Characters');
      }
      if (errors['maxlength']?.requiredLength === 5) {
        return this.translateService.instant('adminLength5Characters');
      }
      if (errors['maxlength']?.requiredLength === 6) {
        return this.translateService.instant('adminLength6Characters');
      }
      if (errors['noEqualPasswords']) {
        return this.translateService.instant('adminNoEqualPasswords');
      }
    }
    return '';
  }

  validateDeviceSerialNumber(value: string) {
    if (value.length >= 6) {
      const existDevice = this.devices.some(
        (device) => device.serialNumber?.toLowerCase() === value?.toLowerCase()
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
      (group) => group.teamName?.toLowerCase() === value?.toLowerCase()
    );
    if (existGroupName) {
      this.addGroupForm.controls['teamName'].setErrors({
        existName: true,
      });
    }
  }

  validateEmailCollaborator(value: string) {
    const existEmail = this.collaborators.some(
      (collaborator) => collaborator.email?.toLowerCase() === value?.toLowerCase()
    );
    if (existEmail) {
      this.addCollaboratorForm.controls['email'].setErrors({
        existEmail: true,
      });
    }
  }

  validatePasswordsCollaborator(password1: string, password2: string) {
    const equalPasswords = password1 === password2;
    if (!equalPasswords) {
      this.addCollaboratorForm.controls['password'].setErrors({
        noEqualPasswords: true,
      });
      this.addCollaboratorForm.controls['confirmPassword'].setErrors({
        noEqualPasswords: true,
      });
    } else {
      this.addCollaboratorForm.controls['password'].setErrors({
        noEqualPasswords: false,
      });
      this.addCollaboratorForm.controls['confirmPassword'].setErrors({
        noEqualPasswords: false,
      });
    }
  }

  validateEmailUser(value: string) {
    const existEmail = this.users.some(
      (user) => user.email?.toLowerCase() === value?.toLowerCase()
    );
    if (existEmail) {
      this.addUserForm.controls['email'].setErrors({
        existEmail: true,
      });
    }
  }

  clearProfilesSearch() {
    this.actionsProfilesForm.patchValue({
      search: '',
    });
    this.filterProfiles();
  }

  clearDevicesSearch() {
    this.actionsDevicesForm.patchValue({
      search: '',
    });
    this.filterDevices();
  }

  clearGroupsSearch() {
    this.actionsGroupsForm.patchValue({
      search: '',
    });
    this.filterGroups();
  }

  clearCollaboratorsSearch() {
    this.actionsCollaboratorsForm.patchValue({
      search: '',
    });
    this.filterCollaborators();
  }

  clearUsersSearch() {
    this.actionsUsersForm.patchValue({
      search: '',
    });
    this.filterUsers();
  }

  filterAll() {
    this.filterProfiles();
    this.filterDevices();
    this.filterGroups();
    this.filterCollaborators();
    this.filterUsers();
  }
}
