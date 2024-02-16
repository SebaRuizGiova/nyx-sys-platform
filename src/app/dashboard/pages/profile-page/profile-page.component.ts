import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { LanguageService } from 'src/app/shared/services/language.service';
import {
  Birthdate,
  CalcDatum,
  Profile,
  SleepData,
  Status,
} from '../../interfaces/profile.interface';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { HelpersService } from 'src/app/shared/services/helpers.service';
import { LiveData } from '../../interfaces/live-data.interface';
import { TimezoneService } from 'src/app/shared/services/timezoneService.service';

@Component({
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  public periodForm: FormGroup = this.fb.group({
    period: this.helpersService.getActualDate(
      this.timezoneService.timezoneOffset
    ),
  });
  public gmtForm: FormGroup = this.fb.group({
    gmt: this.timezoneService.timezoneOffset,
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
  public gmtItems: ItemDropdown[] = this.helpersService.GMTItems;
  public messageSleepScore: string = '';
  public selectedProfileId: string = '';
  public selectedProfileIndex: number = 0;
  public totalRecoveryToChart: any[] = [];
  public sleepScoreToChart: any[] = [];
  public ansToChart: any[] = [];
  public hrvToChart: {
    hrArray: any[];
    hrvArray: any[];
    laArray: any[];
    timestamps: any[];
    absent: any[];
  } = {
    hrArray: [],
    hrvArray: [],
    laArray: [],
    timestamps: [],
    absent: [],
  };
  public hrToChart: {
    hrArray: any[];
    timestamps: any[];
    absent: any[];
  } = {
    hrArray: [],
    timestamps: [],
    absent: [],
  };
  public brToChart: {
    brArray: any[];
    timestamps: any[];
    absent: any[];
  } = {
    brArray: [],
    timestamps: [],
    absent: [],
  };
  public sleepTimeToChart: {
    durationInBed: any[];
    durationInSleep: any[];
    durationInAwake: any[];
    dates: any[];
  } = {
    durationInBed: [],
    durationInSleep: [],
    durationInAwake: [],
    dates: [],
  };

  public movementToChart: any;

  public profileData?: Profile;

  private intervalId: any;

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService,
    private route: ActivatedRoute,
    private router: Router,
    private databaseService: DatabaseService,
    private loadingService: LoadingService,
    private helpersService: HelpersService,
    private timezoneService: TimezoneService
  ) {}

  ngOnInit(): void {
    this.languageService.langChanged$.subscribe(() => {
      this.loadTranslations();
      if (this.profileData?.sleepData && this.profileData?.selectedSleepData) {
        const processedSleepData = this.processSleepScoreData(
          this.profileData.sleepData,
          this.profileData.selectedSleepData
        );

        this.setSleepScoreMessage(processedSleepData);
      }
    });
    this.route.paramMap.subscribe((params) => {
      const userId = params.get('userId') || '';
      const profileId = params.get('profileId') || '';
      this.selectedProfileId = profileId;

      this.loadData(userId, profileId);
      clearInterval(this.intervalId);
      this.intervalId = setInterval(
        async () => await this.getLiveData(),
        30000
      );
    });

    this.setProfilesItems();
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
        profileId
      );
    const sleepData = <SleepData[]>(
      sleepDataSnapshot.docs.map((doc) => doc.data())
    );
    const formattedSleepData = sleepData.map((data) => {
      const duration_in_sleep_parsed = this.helpersService.calcHoursSleepData(
        data.duration_in_sleep
      );
      const duration_in_bed_parsed = this.helpersService.calcHoursSleepData(
        data.duration_in_bed
      );
      const duration_awake_parsed = this.helpersService.calcHoursSleepData(
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
        data.duration_in_light
      );
      const duration_in_deep_percent = this.helpersService.calcPercentHours(
        data.duration_in_sleep,
        data.duration_in_deep
      );
      const duration_in_rem_percent = this.helpersService.calcPercentHours(
        data.duration_in_sleep,
        data.duration_in_rem
      );

      return {
        ...data,
        duration_in_sleep_parsed,
        duration_in_bed_parsed,
        duration_awake_parsed,
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
      sleepData: [...formattedSleepData],
    };

    if (this.profileData?.sleepData) {
      this.totalRecoveryToChart = this.getTotalRecoveryToChart(
        this.profileData.sleepData
      );
      this.sleepScoreToChart = this.getSleepScoreToChart(
        this.profileData.sleepData
      );
    }

    this.periodItems = this.helpersService.generatePeriods(
      [this.profileData],
      this.timezoneService.timezoneOffset
    );
    this.selectSleepData();

    this.getLiveData();

    const processedSleepData = this.processSleepScoreData(
      this.profileData.sleepData,
      this.profileData.selectedSleepData
    );

    this.setSleepScoreMessage(processedSleepData);

    this.selectedProfileIndex = this.profilesItems.findIndex(
      (profile) => profile.value === this.selectedProfileId
    );
  }

  setProfilesItems() {
    let profileItems: ItemDropdown[] = [];

    if (this.databaseService.profiles.length) {
      profileItems = this.databaseService.profiles.map((profile) => ({
        label: `${profile.name} ${profile.lastName}`,
        value: profile.id,
        userId: profile.userID,
      }));
      localStorage.setItem('profiles', JSON.stringify(profileItems));
    } else {
      profileItems = JSON.parse(localStorage.getItem('profiles') || '[]');
    }
    this.profilesItems = profileItems;
  }

  async getLiveData() {
    try {
      if (this.profileData?.deviceSN) {
        const liveDataSnapshot =
          await this.databaseService.getLiveDataCollection(
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

        this.profileData = {
          ...this.profileData,
          liveData: mapLiveData,
        };
      }
    } catch (error) {
      console.log(error);
    }
  }

  selectSleepData(event?: any) {
    if (this.profileData!.sleepData!.length) {
      this.periodForm.patchValue({
        period: event
          ? event
          : this.helpersService.formatTimestampToDate(
              this.profileData!.sleepData[0]!.to || 0,
              this.timezoneService.timezoneOffset
            ),
      });
    }

    const selectedPeriod = this.periodForm.value.period;

    if (this.profileData) {
      const selectedSleepData = this.profileData.sleepData.find((sd) => {
        const periodData = this.helpersService.formatTimestampToDate(
          sd.to,
          this.timezoneService.timezoneOffset
        );
        return periodData === selectedPeriod;
      });
      const previousSleepData = this.profileData.sleepData.find((sd) => {
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
      this.profileData = {
        ...this.profileData,
        selectedSleepData,
        previousSleepData,
      };

      const processedSleepData = this.processSleepScoreData(
        this.profileData.sleepData,
        this.profileData.selectedSleepData
      );

      this.setSleepScoreMessage(processedSleepData);
    }

    this.totalRecoveryToChart = this.getTotalRecoveryToChart(
      this.profileData?.sleepData || []
    );
    this.sleepScoreToChart = this.getSleepScoreToChart(
      this.profileData?.sleepData || []
    );
    this.ansToChart = this.getAnsToChart(this.profileData?.selectedSleepData);
    this.hrvToChart = this.getHrvToChart(this.profileData?.selectedSleepData);
    this.hrToChart = this.getHrToChart(this.profileData?.selectedSleepData);
    this.brToChart = this.getBrToChart(this.profileData?.selectedSleepData);
    this.movementToChart = this.getMovementToChart(
      this.profileData?.selectedSleepData
    );
    this.sleepTimeToChart = this.getSleepTimeToChart(
      this.profileData?.sleepData,
      this.profileData?.selectedSleepData
    );
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

  selectBackProfile() {
    if (this.selectedProfileIndex > 0) {
      const selectedProfile = this.profilesItems[this.selectedProfileIndex - 1];
      this.router.navigate([
        '/dashboard/profile/' +
          selectedProfile.userId +
          '/' +
          selectedProfile.value,
      ]);
    }
  }

  selectNextProfile() {
    if (this.selectedProfileIndex < this.profilesItems.length - 1) {
      const selectedProfile = this.profilesItems[this.selectedProfileIndex + 1];
      this.router.navigate([
        '/dashboard/profile/' +
          selectedProfile.userId +
          '/' +
          selectedProfile.value,
      ]);
    }
  }

  setSleepScoreMessage(processedSleepData: {
    sleepScore: number;
    consecutiveDays: number;
  }) {
    const { consecutiveDays, sleepScore } = processedSleepData;

    if (consecutiveDays === 1 && sleepScore >= 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage1+')
        .subscribe((translations: any) => {
          const messages = translations;
          let message = this.getRandomMessage(messages);
          if (message.includes('*sleep_score*')) {
            message = message.replace('*sleep_score*', sleepScore.toString());
          }
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 1 && sleepScore < 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage1-')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 2 && sleepScore >= 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage2+')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 2 && sleepScore < 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage2-')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 3 && sleepScore >= 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage3+')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 3 && sleepScore < 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage3-')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 4 && sleepScore >= 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage4+')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 4 && sleepScore < 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage4-')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 5 && sleepScore >= 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage5+')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 5 && sleepScore < 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage5-')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 6 && sleepScore >= 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage6+')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 6 && sleepScore < 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage6-')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 7 && sleepScore >= 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage7+')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 7 && sleepScore < 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage7-')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
        // TODO: Definir mensaje por defecto
    } else if (consecutiveDays === 8 && sleepScore >= 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage8+')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 8 && sleepScore < 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage8-')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 9 && sleepScore >= 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage9+')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 9 && sleepScore < 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage9-')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 10 && sleepScore >= 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage10+')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 10 && sleepScore < 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessage10-')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 14 && sleepScore >= 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessageTwoWeeks+')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 14 && sleepScore < 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessageTwoWeeks-')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 21 && sleepScore >= 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessageThreeWeeks+')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 21 && sleepScore < 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessageThreeWeeks-')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 30 && sleepScore >= 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessageOneMonth+')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (consecutiveDays === 30 && sleepScore < 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessageOneMonth-')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    } else if (sleepScore >= 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessageDefault+')
        .subscribe((translations: any) => {
          const messages = translations;
          let message = this.getRandomMessage(messages);
          if (message.includes('*sleep_score*')) {
            message = message.replace('*sleep_score*', sleepScore.toString());
          }
          this.messageSleepScore = message;
        });
    } else if (sleepScore < 80) {
      this.languageService
        .getTranslate('profileSleepScoreMessageDefault-')
        .subscribe((translations: any) => {
          const messages = translations;
          const message = this.getRandomMessage(messages);
          this.messageSleepScore = message;
        });
    }
  }

  setRecoveryMessage() {
    // TODO: Desarrollar funcion
  }

  setANSMessage() {
    // TODO: Desarrollar funcion
  }

  getRandomMessage(messages: string[]): string {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }

  processSleepScoreData(sleepDataArray: SleepData[], selectedSleepData?: SleepData) {
    if (selectedSleepData) {
      const selectedSleepScore: number = selectedSleepData.sleep_score || 0;
      let selectedSleepScoreStatus: 'negative' | 'positive' =
        selectedSleepScore > 80 ? 'positive' : 'negative';
      let actualSleepScoreStatus: 'negative' | 'positive' | '' = '';
      let consecutiveDays: number = 0;
      const selectedSleepDataIndex: number = sleepDataArray.findIndex(
        (sd) => sd.id === selectedSleepData.id
      );

      for (const [index, sleepData] of sleepDataArray.entries()) {
        if (
          index > selectedSleepDataIndex
        ) {
          if (sleepData.sleep_score && sleepData.sleep_score >= 80) {
            actualSleepScoreStatus = 'positive';
          } else if (sleepData.sleep_score && sleepData.sleep_score < 80) {
            actualSleepScoreStatus = 'negative';
          }
          if (selectedSleepScoreStatus === actualSleepScoreStatus) {
            consecutiveDays++;
          } else {
            break;
          }
        }
      }

      return {
        sleepScore: selectedSleepScore,
        consecutiveDays,
      };
    }

    return {
      sleepScore: 0,
      consecutiveDays: 0,
    };
  }

  changeGMT(event: any) {
    this.timezoneService.timezoneOffset = event;
    const snapshotRoute = this.route.snapshot;
    const userId = snapshotRoute.params['userId'] || '';
    const profileId = snapshotRoute.params['profileId'] || '';
    this.selectedProfileId = profileId;

    this.loadData(userId, profileId);
  }

  getTotalRecoveryToChart(sleepDataArray: SleepData[]) {
    const totalRecoveryArray: any[] = [];
    const periodIndex = sleepDataArray.findIndex((sd) => {
      const formattedTimeStamp = this.helpersService.formatTimestampToDate(
        sd.to,
        this.timezoneService.timezoneOffset
      );
      return formattedTimeStamp === this.periodForm.value.period;
    });

    const newTotalRecoveryArray = sleepDataArray.slice(periodIndex);

    let count = 0;
    for (const sleepData of newTotalRecoveryArray) {
      if (
        sleepData.hrv_data &&
        sleepData.hrv_data.length > 0 &&
        sleepData.hrv_data[0].totalRecovery !== undefined
      ) {
        totalRecoveryArray.push({
          totalRecovery: sleepData.hrv_data[0].totalRecovery,
          date: this.helpersService.formatTimestampToDate(
            sleepData.to,
            this.timezoneService.timezoneOffset
          ),
        });

        count++;

        if (count === 7) {
          break;
        }
      }
    }

    return totalRecoveryArray.reverse();
  }

  getSleepScoreToChart(sleepDataArray: SleepData[]) {
    const sleepScoreArray: any[] = [];
    const periodIndex = sleepDataArray.findIndex((sd) => {
      const formattedTimeStamp = this.helpersService.formatTimestampToDate(
        sd.to,
        this.timezoneService.timezoneOffset
      );
      return formattedTimeStamp === this.periodForm.value.period;
    });

    const newSleepScoreArray = sleepDataArray.slice(periodIndex);

    let count = 0;
    for (const sleepData of newSleepScoreArray) {
      if (sleepData.sleep_score) {
        sleepScoreArray.push({
          sleepScore: sleepData.sleep_score > 100 ? 100 : sleepData.sleep_score,
          date: this.helpersService.formatTimestampToDate(
            sleepData.to,
            this.timezoneService.timezoneOffset
          ),
        });

        count++;

        if (count === 7) {
          break;
        }
      }
    }

    return sleepScoreArray.reverse();
  }

  getAnsToChart(selectedSleepDataArray?: SleepData) {
    if (selectedSleepDataArray) {
      const ansArray: any[] = [];
      let duration_out_of_bed: any[] = [];
      const newAnsArray = selectedSleepDataArray.hrv_rmssd_data;

      /*  const bedExitData = 1; */

      let exit = 0;

      newAnsArray.forEach((data: any, index: number) => {
        /* TO ADD THE BEDEXIT LINES */
        if (selectedSleepDataArray.bedexit_data !== undefined) {
          if (selectedSleepDataArray.bedexit_data[exit] !== undefined) {
            if (
              data.timestamp >
              selectedSleepDataArray.bedexit_data[exit].startTimestamp
            ) {
              duration_out_of_bed.push(100);
              newAnsArray[index] = {
                ...newAnsArray[index],
                hf: null,
                lf: null,
              };
            } else {
              duration_out_of_bed.push(null);
            }
            if (
              data.timestamp >
              selectedSleepDataArray.bedexit_data[exit].endTimestamp
            ) {
              exit++; //WHEN A LINE GETS ADDED IT MOVES TO THE NEXT TIMESTAMP
            }
          }
        }
      });

      for (const ans of newAnsArray) {
        ansArray.push({
          hf: ans.hf,
          lf: ans.lf,
          bedExit: duration_out_of_bed,
          date: this.helpersService.calcHoursSleepData(ans.timestamp),
        });
      }

      return ansArray;
    }
    return [];
  }

  getHrvToChart(selectedSleepData?: SleepData) {
    let heartRateArray: any[] = [];
    let RMSSDArray: any[] = [];
    let adjustmentLine: any[] = [];
    let timestamps: any[] = [];
    let datesLabel: any[] = [];
    let absent: any[] = [];

    if (selectedSleepData) {
      const {
        calc_data,
        hrv_rmssd_data,
        hrv_rmssd_evening,
        hrv_rmssd_morning,
      } = selectedSleepData;

      let exit = 0;

      // selectedSleepData.hrv_rmssd_data.forEach((data: any, index: number) => {
      //   /* TO ADD THE BEDEXIT LINES */
      //   if (selectedSleepData.bedexit_data !== undefined) {
      //     if (selectedSleepData.bedexit_data[exit] !== undefined) {
      //       if (
      //         data.timestamp >
      //         selectedSleepData.bedexit_data[exit].startTimestamp
      //       ) {
      //         absent.push([selectedSleepData.bedexit_data[exit].startTimestamp, 100]);
      //       } else {
      //         absent.push([0, 0]);
      //       }
      //       if (
      //         data.timestamp >
      //         selectedSleepData.bedexit_data[exit].endTimestamp
      //       ) {
      //         exit++; //WHEN A LINE GETS ADDED IT MOVES TO THE NEXT TIMESTAMP
      //       }
      //     }
      //   }
      // });

      calc_data.forEach((data: any) => {
        timestamps.push(data.timestamp);
        heartRateArray.push([data.timestamp, data.heartRate]);
      });

      for (let i = 0; i < calc_data.length; i++) {
        if ((i + 1) % 24 === 0) {
          datesLabel.push(
            this.helpersService.formatTimestamp(
              calc_data[i].timestamp,
              this.timezoneService.timezoneOffset
            )
          );
        } else {
          datesLabel.push('');
        }
      }

      for (let i = 0; i < hrv_rmssd_data.length; i++) {
        const timestamp = hrv_rmssd_data[i].timestamp;

        for (let j = 0; j < timestamps.length - 1; j++) {
          const inicioIntervalo = timestamps[j];
          const finIntervalo = timestamps[j + 1];

          if (timestamp > inicioIntervalo && timestamp < finIntervalo) {
            RMSSDArray.push([timestamps[j], hrv_rmssd_data[i].rmssd]);
            break;
          }
        }
      }

      for (let i = 0; i < hrv_rmssd_data.length; i++) {
        const timestamp = hrv_rmssd_data[i].timestamp;

        for (let j = 0; j < timestamps.length - 1; j++) {
          const inicioIntervalo = timestamps[j];
          const finIntervalo = timestamps[j + 1];

          if (
            timestamp > inicioIntervalo &&
            timestamp < finIntervalo &&
            i === 0
          ) {
            adjustmentLine.push([timestamp, hrv_rmssd_evening]);
            break;
          }
        }
      }

      const ultimoTimestamp = hrv_rmssd_data
        .slice()
        .reverse()
        .find(
          (element) => element.timestamp < timestamps[timestamps.length - 1]
        );
      if (ultimoTimestamp) {
        adjustmentLine.push([ultimoTimestamp.timestamp, hrv_rmssd_morning]);
      }
    }

    return {
      hrArray: heartRateArray,
      hrvArray: RMSSDArray,
      laArray: adjustmentLine,
      timestamps: timestamps,
      labelsX: datesLabel,
      absent,
    };
  }

  getHrToChart(selectedSleepData?: SleepData) {
    let heartRateArray: any[] = [];
    let timestamps: any[] = [];

    if (selectedSleepData) {
      const { calc_data } = selectedSleepData;

      calc_data.forEach((data: any) => {
        timestamps.push(data.timestamp);
        heartRateArray.push([data.timestamp, data.heartRate]);
      });
    }

    return {
      hrArray: heartRateArray,
      timestamps: timestamps,
      absent: [],
    };
  }

  getBrToChart(selectedSleepData?: SleepData) {
    let breathingRateArray: any[] = [];
    let timestamps: any[] = [];

    if (selectedSleepData) {
      const { calc_data } = selectedSleepData;

      calc_data.forEach((data: any) => {
        timestamps.push(data.timestamp);
        breathingRateArray.push([data.timestamp, data.breathingRate]);
      });
    }

    return {
      brArray: breathingRateArray,
      timestamps: timestamps,
      absent: [],
    };
  }

  getMovementToChart(selectedSleepData?: SleepData) {
    let counter = 0;
    let sumActivity = 0;
    let datesOfficial: any[] = [];
    let timestamps: any[] = [];
    let totalActivity: any[] = [];
    let movement: any[] = [];

    if (selectedSleepData) {
      selectedSleepData.calc_data.forEach((data: CalcDatum) => {
        counter = counter + 1;
        if (counter == 5) {
          datesOfficial.push(data);
          timestamps.push(
            this.helpersService.formatTimestamp(
              data.timestamp,
              this.timezoneService.timezoneOffset
            )
          );
          counter = 0;
        }
      });

      counter = 0;

      if (selectedSleepData.movement_data) {
        selectedSleepData.movement_data.forEach((data) => {
          sumActivity = sumActivity + data;
          counter = counter + 1;
          if (
            counter == 5 ||
            data ==
              selectedSleepData.movement_data[
                selectedSleepData.movement_data.length - 1
              ]
          ) {
            sumActivity = Math.floor(sumActivity / 75);
            totalActivity.push(sumActivity);
            counter = 0;
            sumActivity = 0;
          }
        });
      }

      let finalCalcData: CalcDatum =
        selectedSleepData.calc_data[selectedSleepData.calc_data.length - 1];

      // I have to add the awakening time to the array
      var timeline: number[] = selectedSleepData.tossnturn_data;
      timeline.push(finalCalcData.timestamp);
      datesOfficial.push(finalCalcData);
      var date = new Date(finalCalcData.timestamp * 1000)
        .toString()
        .substr(16, 8);
      timestamps.push(date);

      counter = 0;
      var sumMovement = 0;
      datesOfficial.forEach((data) => {
        while (data.timestamp > timeline[counter]) {
          sumMovement += 1;
          counter++;
        }
        movement.push(sumMovement);
        sumMovement = 0;
      });

      // movement = movement.map((mov, index) => {
      //   return [timestamps[index], mov]
      // })
      // totalActivity = totalActivity.map((activitie, index) => {
      //   return [timestamps[index], activitie]
      // })
    }

    return {
      movement,
      totalActivity,
      timestamps,
    };
  }

  getSleepTimeToChart(
    sleepDataArray?: SleepData[],
    selectedSleepData?: SleepData
  ) {
    let durationInBed: any[] = [];
    let durationInSleep: any[] = [];
    let durationInAwake: any[] = [];
    let dates: any[] = [];

    if (sleepDataArray && selectedSleepData) {
      const startIndex = sleepDataArray.findIndex(
        (night) => night.to === selectedSleepData.to
      );
      if (startIndex !== -1) {
        sleepDataArray
          .slice(startIndex, startIndex + 6)
          .forEach((night: any) => {
            durationInSleep.push(
              night.duration_in_sleep
                ? Number((night.duration_in_sleep / 60 / 60).toFixed(2))
                : 0
            );
            // durationInBed.push(
            //   night.duration_in_bed
            //     ? Number((night.duration_in_bed / 60 / 60).toFixed(2))
            //     : 0
            // );
            durationInAwake.push(
              night.duration_awake
                ? Number((night.duration_awake / 60 / 60).toFixed(2))
                : 0
            );
            dates.push(
              this.helpersService.formatTimestampToDate(
                night.to,
                this.timezoneService.timezoneOffset
              )
            );
          });
      }
    }
    return {
      durationInBed,
      durationInSleep,
      durationInAwake,
      dates,
    };
  }
}
