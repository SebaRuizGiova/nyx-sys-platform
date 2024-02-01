import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, mergeMap } from 'rxjs';
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
    user: ['', Validators.required],
  });
  public addGroupForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    gmt: ['', Validators.required],
    user: ['', Validators.required],
  });
  public addCollaboratorForm: FormGroup = this.fb.group({
    email: [
      '',
      Validators.required,
      Validators.pattern(this.validatorsService.emailPattern),
    ],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
    alias: ['', Validators.required],
    role: ['', Validators.required],
    user: ['', Validators.required],
  });
  public addUserForm: FormGroup = this.fb.group({
    email: [
      '',
      Validators.required,
      Validators.pattern(this.validatorsService.emailPattern),
    ],
    alias: ['', Validators.required],
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
  public showAddDevice: boolean = false;
  public showAddGroup: boolean = false;
  public showAddCollaborator: boolean = false;
  public showAddUser: boolean = false;
  public genderItems: ItemDropdown[] = [];
  public usersItems: ItemDropdown[] = [];
  public groupsItems: ItemDropdown[] = [];
  public countriesItems: ItemDropdown[] = [];
  public gmtItems: ItemDropdown[] = this.helpersService.GMTItems;
  public roleCollaboratorItems: ItemDropdown[] = [];
  public roleUserItems: ItemDropdown[] = [];

  public userIdProfileToDelete: string = '';
  public profileIdToDelete: string = '';
  public profileIdToEdit?: string;
  public enableEditProfile: boolean = false;

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
          this.usersItems = this.users.map((user) => ({
            label: user.nickName,
            value: user.id,
          }));
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
        results.forEach((result: any) => {
          const userData: User = result[3];
          if (userData.collaborators) {
            userData.collaborators.forEach((collaborator: Collaborator) => {
              const collaboratorWithLinked = {
                ...collaborator,
                linked: userData.nickName,
                userId: userData.id
              };
              collaborators = [...collaborators, collaboratorWithLinked];
            });
          }
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
        this.loadingService.setLoading(false);
      });
  }

  // Filtrado y acciones
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
            .toLowerCase()
            .includes(this.actionsDevicesForm.value.search.toLowerCase()) &&
          device.teamID === groupId
        );
      });
    } else {
      this.filteredDevices = this.devicesByUser.filter((device) => {
        return device.serialNumber
          .toLowerCase()
          .includes(this.actionsDevicesForm.value.search.toLowerCase());
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
    this.filteredCollaborators = this.collaboratorsByUser.filter((collaborator) => {
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
      this.profilesByUser = this.profiles.filter(profile => profile.userID === userId);
      this.devicesByUser = this.devices.filter(device => device.userID === userId);
      this.groupsByUser = this.groups.filter(group => group.userID === userId);
      this.collaboratorsByUser = this.collaborators.filter(collaborator => collaborator.userId === userId);

      this.filteredProfiles = this.profilesByUser;
      this.filteredDevices = this.devicesByUser;
      this.filteredGroups = this.groupsByUser;
      this.filteredCollaborators = this.collaboratorsByUser;
    }
  }

  // Modales perfiles
  toggleAddProfile() {
    this.showAddProfile = !this.showAddProfile;

    if (this.userRole !== 'superAdmin') {
      this.selectUser(this.authService.userId);
    }
  }

  toggleEditProfile(profile: Profile) {
    this.enableEditProfile = !this.enableEditProfile;
    this.showAddProfile = !this.showAddProfile;
    this.profileIdToEdit = profile.id;

    const birthdate = new Date(profile.birthdate.seconds * 1000);

    const newValue = {
      ...profile,
      birthdate,
    }

    this.addProfileForm.patchValue(newValue);
    this.selectUser(
      this.userRole !== 'superAdmin'
        ? this.authService.userId
        : this.addProfileForm.value.userID,
      profile.teamID
    );
  }

  toggleConfirmDeleteProfile(userId?: string, profileId?: string) {
    if (userId && profileId) {
      this.userIdProfileToDelete = userId;
      this.profileIdToDelete = profileId;
    }

    this.showConfirmDeleteProfile = !this.showConfirmDeleteProfile;
  }

  // Modales dispositivos
  toggleAddDevice() {
    this.showAddDevice = !this.showAddDevice;
  }

  // Modales grupos
  toggleAddGroup() {
    this.showAddGroup = !this.showAddGroup;
  }

  // Modales colaboradores
  toggleAddCollaborator() {
    this.showAddCollaborator = !this.showAddCollaborator;
  }

  // Modales usuarios
  toggleAddUser() {
    this.showAddUser = !this.showAddUser;
  }

  // Acciones perfiles
  addProfile() {
    if (this.addProfileForm.status !== 'INVALID') {
      const profileRef = this.firestore.collection(
        `/users/nyxsys/content/${
          this.userRole === 'superAdmin'
            ? this.addProfileForm.value.userID
            : this.authService.userId
        }/players`
      );

      console.log(this.addProfileForm.value);

      this.loadingService.setLoading(true);
      profileRef
      .add({
        ...this.addProfileForm.value
      })
      .then(() => {
          this.toggleAddProfile();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Perfil agregado correctamente',
          });
          this.loadData();
        })
        .catch(() => {
          this.loadingService.setLoading(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al agregar el perfil',
          });
        });
    }
  }

  editProfile() {
    if (this.addProfileForm.status !== 'INVALID') {
      const profileRef = this.firestore.doc(
        `/users/nyxsys/content/${
          this.userRole === 'superAdmin'
            ? this.addProfileForm.value.userID
            : this.authService.userId
        }/players/${this.profileIdToEdit}`
      );

      console.log(this.addProfileForm.value);
      console.log(this.profileIdToEdit);

      this.loadingService.setLoading(true);
      profileRef
      .set({
        ...this.addProfileForm.value
      }, { merge: true })
      .then(() => {
          this.toggleAddProfile();
          this.actionsProfilesForm.reset();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Perfil agregado correctamente',
          });
          this.profileIdToEdit = '';
          this.loadData();
        })
        .catch(() => {
          this.loadingService.setLoading(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al agregar el perfil',
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
  }

  deleteProfile() {
    const profileRef = this.firestore.doc(
      `/users/nyxsys/content/${this.userIdProfileToDelete}/players/${this.profileIdToDelete}`
    );

    this.userIdProfileToDelete = '';
    this.profileIdToDelete = '';

    this.toggleConfirmDeleteProfile();
    this.loadingService.setLoading(true);
    profileRef
      .delete()
      .then(() => {
        this.actionsProfilesForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Perfil eliminado correctamente',
        });
        this.loadData();
      })
      .catch(() => {
        this.loadingService.setLoading(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar el perfil',
        });
      });
  }

  hideProfile(userIdProfile: string, profileId: string, hideValue: boolean) {
    const profileRef = this.firestore.doc(
      `/users/nyxsys/content/${userIdProfile}/players/${profileId}`
    );

    this.loadingService.setLoading(true);
    profileRef
      .update({ hided: !hideValue })
      .then(() => {
        this.actionsProfilesForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Perfil ${hideValue ? 'mostrado' : 'oculto'} correctamente`,
        });
        this.loadData();
      })
      .catch(() => {
        this.loadingService.setLoading(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al ${hideValue ? 'mostrar' : 'ocultar'} el perfil`,
        });
      });
  }

  // Helpers
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

  selectUser(userId: string, teamId?: string) {
    this.addProfileForm.controls['teamID'].reset({
      value: teamId || '',
      disabled: false,
    });
    this.addProfileForm.patchValue({
      userID: userId
    });
    this.groupsItems = this.groups
      .filter((group) => group.userID === userId)
      .map((group: Group) => ({
        label: group.teamName,
        value: group.id,
      }));
  }
}
