import { Injectable } from '@angular/core';
import { Profile } from 'src/app/dashboard/interfaces/profile.interface';
@Injectable({
  providedIn: 'root',
})
export class HelpersService {
  compareDates = (date1: string, date2: string): number => {
    const date1Obj = new Date(date1.split('/').reverse().join('/'));
    const date2Obj = new Date(date2.split('/').reverse().join('/'));

    if (date1Obj > date2Obj) {
      return -1; // Si fecha1 es mayor, se coloca antes en el orden
    } else if (date1Obj < date2Obj) {
      return 1; // Si fecha2 es mayor, se coloca después en el orden
    } else {
      return 0; // Si son iguales, no se cambian de posición
    }
  };

  formatTimestampToDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  formatTimestampWithHours(timestamp: number): string {
    const date = new Date(timestamp * 1000);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  }

  generatePeriods(profiles: Profile[]): { label: string; value: string }[] {
    const formattedDates: Set<string> = new Set();

    profiles.forEach((profile) => {
      const filteredSleepData = this.filterOnlyPeriodNight(profile.sleepData);
      filteredSleepData.forEach((sleepData) => {
        if (sleepData.to) {
          const formattedDate = this.formatTimestampToDate(sleepData.to);
          formattedDates.add(formattedDate);
        }
      });
    });

    const sortedDates = Array.from(formattedDates).sort(this.compareDates);

    return sortedDates.map((date) => ({
      label: date,
      value: date,
    }));
  }

  filterOnlyPeriodNight(array: any[]): any[] {
    const sixHoursInMilliseconds = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    const filteredArray = array.filter((obj) => {
      const fromTimestamp = obj.from;
      const toTimestamp = obj.to;

      // Convert timestamps to Date objects
      const fromDate = new Date(fromTimestamp * 1000);
      const toDate = new Date(toTimestamp * 1000);

      // Check conditions: difference > 6 hours and to < 13:00
      const timeDifference = toDate.getTime() - fromDate.getTime();
      const isSixHoursApart = timeDifference > sixHoursInMilliseconds;
      const isBefore13hs = toDate.getHours() < 13;

      return isSixHoursApart && isBefore13hs;
    });

    return filteredArray;
  }

  getActualDate(): string {
    const fechaActual = new Date();

    // Obteniendo día, mes y año
    const dia =
      fechaActual.getDate() < 10
        ? `0${fechaActual.getDate()}`
        : `${fechaActual.getDate()}`;
    const mes =
      fechaActual.getMonth() + 1 < 10
        ? `0${fechaActual.getMonth() + 1}`
        : `${fechaActual.getMonth() + 1}`; // ¡Recuerda que los meses son base 0!
    const año = fechaActual.getFullYear();

    // Construyendo la cadena de fecha en formato dd/MM/yyyy
    const fechaFormateada = `${dia}/${mes}/${año}`;

    return fechaFormateada;
  }
}
