import { Injectable, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { Profile } from 'src/app/dashboard/interfaces/profile.interface';
import { ItemDropdown } from '../components/dropdown/dropdown.component';
import { HttpClient } from '@angular/common/http';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HelpersService {
  public GMTItems: ItemDropdown[] = [
    { label: '-12:00 Baker Island', value: -12 },
    { label: '-11:00 Pago Pago', value: -11 },
    { label: '-10:00 Honolulu', value: -10 },
    { label: '-09:00 Anchorage', value: -9 },
    { label: '-08:00 Los Ángeles, Tijuana', value: -8 },
    { label: '-07:00 Denver, Ciudad de México', value: -7 },
    { label: '-06:00 Chicago, Ciudad de Guatemala', value: -6 },
    { label: '-05:00 Nueva York, Bogotá, Lima', value: -5 },
    { label: '-04:00 Caracas, La Paz, San Juan', value: -4 },
    { label: '-03:00 Buenos Aires, Montevideo, Georgetown', value: -3 },
    { label: '-02:00 Islas Georgias del Sur', value: -2 },
    { label: '-01:00 Azores', value: -1 },
    { label: '±00:00 Londres, Lisboa', value: 0 },
    { label: '+01:00 París, Madrid, Roma', value: 1 },
    { label: '+02:00 Atenas, Estambul', value: 2 },
    { label: '+03:00 Moscú, Riad', value: 3 },
    { label: '+04:00 Dubái, Bakú', value: 4 },
    { label: '+05:00 Islamabad, Taskent', value: 5 },
    { label: '+06:00 Almaty, Dhaka', value: 6 },
    { label: '+07:00 Bangkok, Ho Chi Minh', value: 7 },
    { label: '+08:00 Pekín, Singapur, Hong Kong', value: 8 },
    { label: '+09:00 Tokio, Seúl', value: 9 },
    { label: '+10:00 Sídney, Guam', value: 10 },
    { label: '+11:00 Honiara', value: 11 },
    { label: '+12:00 Suva, Wellington', value: 12 },
  ];
  private cloudFunctionUrl =
    'https://us-central1-honyro-55d73.cloudfunctions.net/app';

  constructor(
    private http: HttpClient,
    private storage: AngularFireStorage,
    private translateService: TranslateService
  ) {}

  compareDates = (date1: string, date2: string, timezone: number): number => {
    const date1Obj = moment
      .tz(date1, 'DD/MM/YYYY', true, 'UTC')
      .utcOffset(timezone);
    const date2Obj = moment
      .tz(date2, 'DD/MM/YYYY', true, 'UTC')
      .utcOffset(timezone);

    if (date1Obj.isAfter(date2Obj)) {
      return -1;
    } else if (date1Obj.isBefore(date2Obj)) {
      return 1;
    } else {
      return 0;
    }
  };

  formatTimestampToDate(timestamp: number, timezone: number): string {
    const date = moment.tz(timestamp * 1000, 'UTC').utcOffset(timezone);
    return date.format('DD/MM/YYYY');
  }

  formatTimestampWithHours(timestamp: number, timezone: number): string {
    const date = moment.tz(timestamp * 1000, 'UTC').utcOffset(timezone);
    return date.format('DD/MM/YYYY, HH:mm');
  }

  generatePeriods(
    profiles: Profile[],
    timezone: number
  ): { label: string; value: string }[] {
    const formattedDates: Set<string> = new Set();

    profiles.forEach((profile) => {
      const filteredSleepData = this.filterOnlyPeriodNight(
        profile.sleepData,
        timezone
      );
      filteredSleepData.forEach((sleepData) => {
        if (sleepData.to) {
          const formattedDate = this.formatTimestampToDate(
            sleepData.to,
            timezone
          );
          formattedDates.add(formattedDate);
        }
      });
    });

    const sortedDates = Array.from(formattedDates).sort((a, b) =>
      this.compareDates(a, b, timezone)
    );

    const currentDate = this.getActualDate(timezone);

    // Verificar si la fecha actual está en el conjunto de fechas
    if (!sortedDates.includes(currentDate)) {
      // Si no está presente, agregarla al principio del array
      sortedDates.unshift(currentDate);
    }

    return sortedDates.map((date) => ({
      label: date,
      value: date,
    }));
  }

  filterOnlyPeriodNight(array: any[], timezone: number): any[] {
    const sixHoursInMilliseconds = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    const filteredArray = array.filter((obj) => {
      const fromTimestamp = obj.from;
      const toTimestamp = obj.to;

      // Convert timestamps to moment objects with the specified timezone
      const fromDate = moment
        .tz(fromTimestamp * 1000, 'UTC')
        .utcOffset(timezone);
      const toDate = moment.tz(toTimestamp * 1000, 'UTC').utcOffset(timezone);

      // Check conditions: difference > 6 hours and to < 13:00
      const timeDifference = toDate.diff(fromDate);
      const isSixHoursApart = timeDifference > sixHoursInMilliseconds;
      const isBefore13hs = toDate.hour() < 13;

      return isSixHoursApart && isBefore13hs;
    });

    return filteredArray;
  }

  getActualDate(timezone: number): string {
    const actualDate = moment().utcOffset(timezone);
    return actualDate.format('DD/MM/YYYY');
  }

  calcHoursSleepData(time: any) {
    if (time?.toString()) {
      return new Date(time * 1000).toISOString().substr(11, 8) + 'hs';
    } else {
      return '';
    }
  }

  calcPercentHours(timeInBed: any, time: any) {
    return Math.floor((time / timeInBed) * 100) + '%';
  }

  calcAverage(hrvArray: any[]) {
    let rmssd = [];
    if (hrvArray.length) {
      rmssd = hrvArray.map((hrv) => Number(hrv.rmssd));

      let sum = 0;
      rmssd?.forEach((data) => {
        sum = Number(sum) + Number(data);
      });
      return (Number(sum) / rmssd?.length).toFixed(1);
    }
    return 0;
  }

  formatTimestamp(timestamp: number, timezone: number) {
    const date = moment.tz(timestamp * 1000, 'UTC').utcOffset(timezone);
    return date.format('HH:mm:ss') + 'hs';
  }

  async sendWelcomeEmail(
    email: string,
    password: string,
    nickName: string,
    role: string
  ) {
    const lang = localStorage.getItem('lang');
    const imageUrl = await this.getUrlImg(
      'Logos/nyx-sys_customer_service.png'
    ).toPromise();

    const data = {
      to: email,
      password: password,
      nickName: nickName,
      role: role,
      imageUrl: imageUrl,
      lang: lang,
    };

    const url = `${this.cloudFunctionUrl}/welcome-email`;
    this.http.post(url, data).subscribe(
      (response) => {},
      (error) => {}
    );
  }

  getUrlImg(imgPath: string): Observable<string> {
    const ref = this.storage.ref(imgPath);
    return ref.getDownloadURL();
  }

  removeAccents(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
