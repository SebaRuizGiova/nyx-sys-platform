import { Injectable, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as moment from 'moment-timezone';

@Injectable({
  providedIn: 'root',
})
export class TimezoneService {
  constructor() {
    this.getLocalTimeZone();
  }

  private _timezoneOffset: number = 0;
  private _timezoneChangedSubject: Subject<number> = new Subject<number>();

  get timezoneOffset(): number {
    return this._timezoneOffset;
  }

  set timezoneOffset(offset: number) {
    this._timezoneOffset = offset;
    this._timezoneChangedSubject.next(offset);
  }

  get timezoneChanged(): Observable<number> {
    return this._timezoneChangedSubject.asObservable();
  }

  private getLocalTimeZone(): void {
    const actualDate = new Date();
    const offsetMinutes = actualDate.getTimezoneOffset();

    this.timezoneOffset = -offsetMinutes / 60;
  }
}
