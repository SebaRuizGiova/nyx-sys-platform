import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private langSubject: Subject<string> = new Subject<string>();

  public currentLang: string = localStorage.getItem('lang') || 'es';
  public langChanged$: Observable<string> = this.langSubject.asObservable();

  constructor(private translate: TranslateService) {
    this.selectLang(this.currentLang);
  }

  selectLang( lang: string ): void {
    this.currentLang = lang;
    this.translate.use(lang);
    this.langSubject.next(lang);
  }

  getTranslate(itemName: string): Observable<any> {
    return this.translate.get(itemName);
  }
}
