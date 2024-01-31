import { EventEmitter, Injectable, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimezoneService implements OnInit {
  private _timezoneOffset: number = 0;
  private _timezoneChangedSubject: Subject<number> = new Subject<number>();
  
  ngOnInit(): void {
    this.timezoneOffset = Number(this.getLocalTimeZone());
  }

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

  private getLocalTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}
