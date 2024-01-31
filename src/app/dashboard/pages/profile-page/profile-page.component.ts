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
    dates: any[];
  } = {
    hrArray: [],
    hrvArray: [],
    laArray: [],
    dates: [],
  };

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
        const processedSleepData = this.processSleepData(
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

    const processedSleepData = this.processSleepData(
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

      const processedSleepData = this.processSleepData(
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

  processSleepData(sleepDataArray: SleepData[], selectedSleepData?: SleepData) {
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
          index > selectedSleepDataIndex &&
          index <= selectedSleepDataIndex + 7
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

      newAnsArray.forEach((data: any) => {
        /* TO ADD THE BEDEXIT LINES */
        if (selectedSleepDataArray.bedexit_data !== undefined) {
          if (selectedSleepDataArray.bedexit_data[exit] !== undefined) {
            if (
              data.timestamp >
              selectedSleepDataArray.bedexit_data[exit].startTimestamp
            ) {
              duration_out_of_bed.push(100);
            } else {
              duration_out_of_bed.push(0);
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
    let compareArray: any[] = [];
    let heartRateArray: any[] = [];
    let RMSSDArray: any[] = [];
    let adjustmentLine: any[] = [];
    let datesLabel: any[] = [];

    if (selectedSleepData) {
      let counter = 0;
      //ARMANDO EL ARRAY PARA EL HEARTRATE
      var countToHour = 24;
      counter = 0;
      selectedSleepData.calc_data.forEach((data: any) => {
        counter = counter + 1;
        if (counter == 2) {
          if (countToHour == 24) {
            compareArray.push(data.timestamp);
            datesLabel.push([
              this.helpersService.formatTimestamp(data.timestamp, this.timezoneService.timezoneOffset)

            ])
            heartRateArray.push(data.heartRate);
            counter = 0;
            countToHour = 1;
          } else {
            compareArray.push(data.timestamp);
            datesLabel.push('')
            heartRateArray.push(data.heartRate);
            counter = 0;
            countToHour++;
          }
        }
      });
  
      // ARMANDO EL ARRAY DEL RMSSD
      counter = 0;
      selectedSleepData.hrv_rmssd_data.forEach((data: any) => {
        var access = true;
        while (access) {
          if (compareArray[counter] < data.timestamp) {
            RMSSDArray.push(null);
            counter++;
          } else {
            RMSSDArray.push(data.rmssd);
            access = false;
            counter++;
          }
        }
      });
  
      // Making the array of the lineal adjustment
      counter = 0;
      var position = 0;
      selectedSleepData.hrv_rmssd_data.forEach((data: any) => {
        var access = true;
        while (access) {
          if (compareArray[counter] < data.timestamp) {
            adjustmentLine.push(null);
            counter++;
          } else {
            access = false;
            if (position == 0) {
              adjustmentLine.push(selectedSleepData.hrv_rmssd_evening);
            }
            if (position == selectedSleepData.hrv_rmssd_data.length - 1) {
              adjustmentLine.push(selectedSleepData.hrv_rmssd_morning);
            }
            if (
              position > 0 &&
              position != selectedSleepData.hrv_rmssd_data.length - 1
            ) {
              adjustmentLine.push(null);
            }
            position++;
            counter++;
          }
        }
      });
    }

    return {
      hrArray: heartRateArray,
      hrvArray: RMSSDArray,
      laArray: adjustmentLine,
      dates: datesLabel
    }
  }
}
