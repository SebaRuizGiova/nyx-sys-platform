import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private selectedLang: 'es' | 'en' | 'it' = 'es';

  constructor(private translate: TranslateService) {}

  get currentLang(): string {
    return this.selectedLang;
  };

  selectLang( lang: 'es' | 'en' | 'it' ): void {
    this.translate.use(lang);
  }
}
