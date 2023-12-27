import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { LanguageService } from 'src/app/shared/services/language.service';
import { Profile, SleepData, Status } from '../../interfaces/profile.interface';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { HelpersService } from 'src/app/shared/services/helpers.service';
import { LiveData } from '../../interfaces/live-data.interface';

@Component({
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit {
  public periodForm: FormGroup = this.fb.group({
    period: this.helpersService.getActualDate(),
  });
  public gmtForm: FormGroup = this.fb.group({
    gmt: '',
  });
  public userForm: FormGroup = this.fb.group({
    user: '',
  });
  public downloadForm: FormGroup = this.fb.group({
    format: ['', Validators.required],
    range: ['', Validators.required],
  });

  public periodItems: ItemDropdown[] = [];
  public usersItems: ItemDropdown[] = [
    {
      label: 'Sebastian Ruiz',
      value: 1,
    },
    {
      label: 'Fernando Lerner',
      value: 2,
    },
    {
      label: 'Lucas Gonzalez',
      value: 3,
    },
  ];
  public formatDownloadItems?: string[];
  public rangeDownloadItems?: string[];
  public gmtOptions: string[] = [
    'GMT -12:00',
    'GMT -11:00',
    'GMT -10:00',
    'GMT -9:00',
    'GMT -8:00',
    'GMT -7:00',
    'GMT -6:00',
    'GMT -5:00',
    'GMT -4:00',
    'GMT -3:00',
    'GMT -2:00',
    'GMT -1:00',
    'GMT +1:00',
    'GMT +2:00',
    'GMT +3:00',
    'GMT +4:00',
    'GMT +5:00',
    'GMT +6:00',
    'GMT +7:00',
    'GMT +8:00',
    'GMT +9:00',
    'GMT +9:30',
    'GMT +10:00',
    'GMT +11:00',
    'GMT +12:00',
  ];

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService,
    private route: ActivatedRoute,
    private databaseService: DatabaseService,
    private loadingService: LoadingService,
    private helpersService: HelpersService
  ) {}

  public profileData?: Profile;

  ngOnInit(): void {
    this.loadTranslations();
    const userId = this.route.snapshot.paramMap.get('userId') || '';
    const profileId = this.route.snapshot.paramMap.get('profileId') || '';

    this.loadData(userId, profileId);
    setInterval(this.loadProfile.bind(this, userId, profileId), 30000)
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
  }

  async loadData(userId: string, profileId: string) {
    this.loadingService.setLoading(true);

    await this.loadProfile(userId, profileId);

    console.log(this.profileData);

    this.loadingService.setLoading(false);
  }

  async loadProfile(userId: string, profileId: string) {
    const profileSnapshot = await this.databaseService.getProfileByGroupPromise(
      userId,
      profileId
    );
    this.profileData = <Profile>profileSnapshot.data();

    const sleepDataSnapshot =
      await this.databaseService.getSleepDataWithotLimitPromise(
        userId,
        profileId
      );
    const sleepData = <SleepData[]>(
      sleepDataSnapshot.docs.map((doc) => doc.data())
    );

    this.profileData = {
      ...this.profileData,
      sleepData
    };

    this.periodItems = this.helpersService.generatePeriods([this.profileData]);

    const liveDataSnapshot = await this.databaseService.getLiveDataPromise(
      typeof this.profileData.deviceSN === 'boolean'
        ? ''
        : this.profileData.deviceSN
    );

    const liveData = <LiveData[]>liveDataSnapshot.docs.map((doc) => doc.data());

    const onlineCondition =
      liveData.filter((data: any) => data.activity === 0).length >= 2;
    const activityCondition =
      liveData.filter((data: any) => data.activity !== 0).length >= 2;

    let mapLiveData: Status;

    if (
      liveData.length === 0 &&
      this.helpersService.compareDates(
        this.helpersService.formatTimestampToDate(liveData[0]?.date_occurred),
        this.periodForm.value.period
      ) === 0
    ) {
      mapLiveData = { status: 'Offline' };
    } else if (
      onlineCondition &&
      this.helpersService.compareDates(
        this.helpersService.formatTimestampToDate(liveData[0]?.date_occurred),
        this.periodForm.value.period
      ) === 0
    ) {
      mapLiveData = { status: 'Online' };
    } else if (
      activityCondition &&
      this.helpersService.compareDates(
        this.helpersService.formatTimestampToDate(liveData[0].date_occurred),
        this.periodForm.value.period
      ) === 0
    ) {
      mapLiveData = { status: 'En actividad' };
    } else {
      mapLiveData = { status: 'Offline' };
    }

    this.profileData = {
      ...this.profileData,
      liveData: mapLiveData
    };
  }
}
