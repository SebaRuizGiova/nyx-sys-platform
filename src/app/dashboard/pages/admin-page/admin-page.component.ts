import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/auth/services/auth.service';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { Profile } from '../../interfaces/profile.interface';
import { Device } from '../../interfaces/device.interface';
import { Group } from '../../interfaces/group.interface';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { User } from '../../interfaces/user.interface';

@Component({
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
  public actionsProfilesForm: FormGroup = this.fb.group({
    search: '',
    filterByGroup: '',
  });

  products: any[] = [
    {
      code: 1545,
      name: 'Celular',
      category: 'Technology',
      quantity: 50,
    },
    {
      code: 1545,
      name: 'Celular',
      category: 'Technology',
      quantity: 50,
    },
    {
      code: 1545,
      name: 'Celular',
      category: 'Technology',
      quantity: 50,
    },
    {
      code: 1545,
      name: 'Celular',
      category: 'Technology',
      quantity: 50,
    },
    {
      code: 1545,
      name: 'Celular',
      category: 'Technology',
      quantity: 50,
    },
    {
      code: 1545,
      name: 'Celular',
      category: 'Technology',
      quantity: 50,
    },
    {
      code: 1545,
      name: 'Celular',
      category: 'Technology',
      quantity: 50,
    },
    {
      code: 1545,
      name: 'Celular',
      category: 'Technology',
      quantity: 50,
    },
    {
      code: 1545,
      name: 'Celular',
      category: 'Technology',
      quantity: 50,
    },
    {
      code: 1545,
      name: 'Celular',
      category: 'Technology',
      quantity: 50,
    },
    {
      code: 1545,
      name: 'Celular',
      category: 'Technology',
      quantity: 50,
    },
  ];
  public profiles: Profile[] = [];
  private lastProfile?: Profile;
  public devices: Device[] = [];
  private lastDevice?: Device;
  public groups: Group[] = [];
  private lastGroup?: Group;
  // TODO: Tipar collaborators
  public collaborators: any[] = [];
  private lastCollaborator?: any;
  public users: User[] = [];
  private lastUser?: User;

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
        this.lastProfile = this.profiles[this.profiles.length - 1];
        this.loadingService.setLoading(false);
      });
    this.loadingService.setLoading(true);
    this.databaseService
      .getDevicesByUser(this.authService.userId)
      .subscribe((devices) => {
        this.devices = devices;
        this.lastDevice = this.devices[this.devices.length - 1];
        this.loadingService.setLoading(false);
      });
    this.loadingService.setLoading(true);
    this.databaseService
      .getGroupsByUserPaginated(this.authService.userId)
      .subscribe((groups) => {
        this.groups = groups;
        this.lastGroup = this.groups[this.groups.length - 1];
        this.loadingService.setLoading(false);
      });
    this.loadingService.setLoading(true);
    this.databaseService
      .getUserData(this.authService.userId)
      .subscribe((user) => {
        this.collaborators = user.collaborators || [];
        this.lastCollaborator = this.collaborators[this.collaborators.length - 1];
      });
    this.loadingService.setLoading(true);
    this.databaseService
      .getAllUsers()
      .subscribe((users) => {
        this.users = users;
        this.lastUser = this.users[this.users.length - 1];
      });
  }
}
