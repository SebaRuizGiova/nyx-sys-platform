import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ItemSidebar } from '../../interfaces/item-sidebar.interface';
import { Language } from '../../interfaces/language.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'shared-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input()
  show: boolean = false;

  public items: ItemSidebar[] = [];

  public configItem: ItemSidebar = {
    label: 'Configuración',
    icon: 'settings.svg',
  };
  public languageItem: ItemSidebar = {
    label: 'Idioma',
    icon: 'earth.svg',
  };
  public languages: any[] = [
    { name: 'Español', code: 'es' },
    { name: 'Inglés', code: 'en' },
    { name: 'Italiano', code: 'it' },
  ];
  public selectedLanguage?: Language;

  constructor(
    private route: ActivatedRoute,
    public translate: TranslateService
  ) {
    const currentLang = localStorage.getItem('lang');
    if (currentLang) {
      translate.setDefaultLang(currentLang);
      this.loadTranslations(currentLang);
      this.selectedLanguage = this.languages.find( lang => lang.code === currentLang );
    } else {
      translate.setDefaultLang('es');
      this.loadTranslations('es');
      this.selectedLanguage = { name: 'Inglés', code: 'es' };
    }
  }

  ngOnInit() {
    this.route.url.subscribe((segments) => {
      this.updateItems(segments);
    });
  }

  private updateItems(segments: any[]) {
    this.items = this.getItems(segments);
  }

  private getItems(segments: any[]): ItemSidebar[] {
    return [
      {
        label: 'Vista grupal',
        icon: 'grid-icon.svg',
      },
      {
        label: 'Panel de administración',
        icon: 'settings-gear-combination.svg',
      },
    ];
  }

  toggleSidebar(value?: boolean): void {
    if (value?.toString()) {
      this.show = value;
      return;
    }
    this.show = !this.show;
  }

  private loadTranslations(languageCode: string) {
    this.translate.use(languageCode);
    this.translate.get('languagesDropdown').subscribe((translations: any) => {
      this.languages = translations;
      localStorage.setItem('lang', languageCode);
      const [currentLang] = this.languages.filter(
        (lang) => lang.code === languageCode
      );
      this.languages = this.languages.filter(
        (lang) => lang.code !== languageCode
      );
      this.languages.unshift(currentLang);
    });
    this.translate.get('languagesDropdown').subscribe((translations: any) => {
      this.languages = translations;
      localStorage.setItem('lang', languageCode);
      const [currentLang] = this.languages.filter(
        (lang) => lang.code === languageCode
      );
      this.languages = this.languages.filter(
        (lang) => lang.code !== languageCode
      );
      this.languages.unshift(currentLang);
    });
  }

  selectLanguage(code: string): void {
    this.loadTranslations(code);
  }
}
