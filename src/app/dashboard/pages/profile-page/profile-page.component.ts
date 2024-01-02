import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { LanguageService } from 'src/app/shared/services/language.service';
import {
  Birthdate,
  Profile,
  SleepData,
  Status,
} from '../../interfaces/profile.interface';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { HelpersService } from 'src/app/shared/services/helpers.service';
import { LiveData } from '../../interfaces/live-data.interface';

@Component({
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit, OnDestroy {
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
  public profilesItems: ItemDropdown[] = [];
  public formatDownloadItems?: string[];
  public rangeDownloadItems?: string[];
  public gmtItems: string[] = [
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

  public profileData?: Profile;

  private intervalId: any;

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService,
    private route: ActivatedRoute,
    private router: Router,
    private databaseService: DatabaseService,
    private loadingService: LoadingService,
    private helpersService: HelpersService
  ) {
    let profileItems: ItemDropdown[] = [];

    if (databaseService.profiles.length) {
      profileItems = databaseService.profiles.map((profile) => ({
        label: `${profile.name} ${profile.lastName}`,
        value: profile.id,
        userId: profile.userID,
      }));
    } else {
      let profilesItemsStorage = JSON.parse(
        localStorage.getItem('profiles') || '[]'
      );

      profileItems = profilesItemsStorage.map((profile: Profile) => ({
        label: `${profile.name} ${profile.lastName}`,
        value: profile.id,
        userId: profile.userID,
      }));
    }
    this.profilesItems = profileItems;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const userId = params.get('userId') || '';
      const profileId = params.get('profileId') || '';

      this.loadData(userId, profileId);
      clearInterval(this.intervalId);
      this.intervalId = setInterval(
        () => this.loadProfile(userId, profileId),
        30000
      );
    });

    this.loadTranslations();
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
  }

  async loadData(userId: string, profileId: string) {
    this.loadingService.setLoading(true);

    await this.loadProfile(userId, profileId);

    console.log(this.profileData);

    this.loadingService.setLoading(false);
  }

  async loadProfile(userId: string, profileId: string) {
    const profileSnapshot = await this.databaseService.getProfileByGroupDoc(
      userId,
      profileId
    );
    this.profileData = <Profile>profileSnapshot.data();

    const sleepDataSnapshot =
      await this.databaseService.getSleepDataWithLimitCollection(
        userId,
        profileId,
        30
      );
    const sleepData = <SleepData[]>(
      sleepDataSnapshot.docs.map((doc) => doc.data())
    );

    const formattedSleepData = sleepData.map((data) => {
      const duration_in_sleep = this.helpersService.calcHoursSleepData(
        data.duration_in_sleep
      );
      const duration_in_bed = this.helpersService.calcHoursSleepData(
        data.duration_in_bed
      );
      const duration_awake = this.helpersService.calcHoursSleepData(
        data.duration_awake
      );
      const duration_in_sleep_percent = this.helpersService.calcPercentHours(
        data.duration_in_bed,
        data.duration_in_sleep
      );
      const duration_awake_percent = this.helpersService.calcPercentHours(
        data.duration_in_bed,
        data.duration_awake
      );
      const average_rmssd = this.helpersService.calcAverage(
        data.hrv_rmssd_data
      );
      const duration_in_light = this.helpersService.calcHoursSleepData(
        data.duration_in_light
      );
      const duration_in_deep = this.helpersService.calcHoursSleepData(
        data.duration_in_deep
      );
      const duration_in_rem = this.helpersService.calcHoursSleepData(
        data.duration_in_rem
      );

      const duration_in_light_percent = this.helpersService.calcPercentHours(
        data.duration_in_sleep,
        data.duration_in_light,
      );
      const duration_in_deep_percent = this.helpersService.calcPercentHours(
        data.duration_in_sleep,
        data.duration_in_deep,
      );
      const duration_in_rem_percent = this.helpersService.calcPercentHours(
        data.duration_in_sleep,
        data.duration_in_rem,
      );

      return {
        ...data,
        duration_in_sleep,
        duration_in_bed,
        duration_awake,
        duration_in_sleep_percent,
        duration_awake_percent,
        average_rmssd,
        duration_in_light,
        duration_in_deep,
        duration_in_rem,
        duration_in_light_percent,
        duration_in_deep_percent,
        duration_in_rem_percent,
      };
    });

    this.profileData = {
      ...this.profileData,
      sleepData: formattedSleepData,
    };

    this.periodItems = this.helpersService.generatePeriods([this.profileData]);
    this.selectSleepData();

    if (this.profileData.deviceSN) {
      const liveDataSnapshot = await this.databaseService.getLiveDataCollection(
        typeof this.profileData.deviceSN === 'boolean'
          ? ''
          : this.profileData.deviceSN
      );

      const liveData = <LiveData[]>(
        liveDataSnapshot.docs.map((doc) => doc.data())
      );

      const onlineCondition =
        liveData.filter((data: any) => data.activity === 0).length >= 2;
      const activityCondition =
        liveData.filter((data: any) => data.activity !== 0).length >= 2;

      let mapLiveData: Status;

      if (
        liveData.length === 0 &&
        this.helpersService.compareDates(
          this.helpersService.formatTimestampToDate(liveData[0]?.date_occurred),
          this.helpersService.getActualDate()
        ) === 0
      ) {
        mapLiveData = { status: 'Offline' };
      } else if (
        onlineCondition &&
        this.helpersService.compareDates(
          this.helpersService.formatTimestampToDate(liveData[0]?.date_occurred),
          this.helpersService.getActualDate()
        ) === 0
      ) {
        mapLiveData = { status: 'Online' };
      } else if (
        activityCondition &&
        this.helpersService.compareDates(
          this.helpersService.formatTimestampToDate(liveData[0].date_occurred),
          this.helpersService.getActualDate()
        ) === 0
      ) {
        mapLiveData = { status: 'En actividad' };
      } else {
        mapLiveData = { status: 'Offline' };
      }

      this.profileData = {
        ...this.profileData,
        liveData: mapLiveData,
      };
    }
  }

  selectSleepData() {
    if (this.profileData!.sleepData!.length) {
      this.periodForm.patchValue({
        period: this.helpersService.formatTimestampToDate(this.profileData!.sleepData[0]!.to || 0)
      })
    }

    const selectedPeriod = this.periodForm.value.period;

    if (this.profileData) {
      const selectedSleepData = this.profileData.sleepData.find((sd) => {
        const periodData = this.helpersService.formatTimestampToDate(sd.to);
        return periodData === selectedPeriod;
      });
      const previousSleepData = this.profileData.sleepData.find((sd) => {
        return (
          this.helpersService.compareDates(
            this.helpersService.formatTimestampToDate(sd.to),
            selectedPeriod
          ) === 1
        );
      });
      this.profileData = {
        ...this.profileData,
        selectedSleepData,
        previousSleepData,
      };
    }
  }

  calculateAge(birthdate: Birthdate | undefined): string {
    if (birthdate) {
      const birthdateInSeconds = birthdate.seconds;
      const millisecondsInSecond = 1000;
      const millisecondsInYear = 31536000000; // 1000 ms * 60 s * 60 min * 24 h * 365 days

      const currentTimestamp = new Date().getTime() / millisecondsInSecond;

      const ageMilliseconds =
        currentTimestamp * millisecondsInSecond -
        birthdateInSeconds * millisecondsInSecond;
      const ageYears = Math.floor(ageMilliseconds / millisecondsInYear);

      return ageYears.toString();
    }
    return '';
  }

  selectProfile(event: ItemDropdown) {
    this.router.navigate([
      '/dashboard/profile/' + event.userId + '/' + event.value,
    ]);
  }
}
