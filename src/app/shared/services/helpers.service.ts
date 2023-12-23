import { Injectable } from '@angular/core';
import { Profile } from 'src/app/dashboard/interfaces/profile.interface';

interface SleepToMap {
  [key: string]: string;
}

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

  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  generatePeriods(profiles: Profile[]): { label: string; value: string }[] {
    const formattedDates: Set<string> = new Set();

    profiles.forEach((profile) => {
    profile.sleepData.forEach((sleepData) => {
      if (sleepData.to) {
        const formattedDate = this.formatTimestamp(sleepData.to);
        formattedDates.add(formattedDate);
      }
    });
  });

  const sortedDates = Array.from(formattedDates).sort(this.compareDates);

  return sortedDates.map( date => ({
      label: date,
      value: date
    }));
  }

  getActualDate(): string {
    const fechaActual = new Date();

    // Obteniendo día, mes y año
    const dia = fechaActual.getDate() < 10 ? `0${fechaActual.getDate()}` : `${fechaActual.getDate()}`;
    const mes = fechaActual.getMonth() + 1 < 10 ? `0${fechaActual.getMonth() + 1}` : `${fechaActual.getMonth() + 1}`; // ¡Recuerda que los meses son base 0!
    const año = fechaActual.getFullYear();

    // Construyendo la cadena de fecha en formato dd/MM/yyyy
    const fechaFormateada = `${dia}/${mes}/${año}`;

    return fechaFormateada;
  }
}
