import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrentRouteService {
  private rutaActivaSubject = new BehaviorSubject<string>('');

  rutaActiva$ = this.rutaActivaSubject.asObservable();

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.rutaActivaSubject.next(event.url);
      }
    });
  }
}
