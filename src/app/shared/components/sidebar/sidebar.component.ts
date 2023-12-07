import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ItemSidebar } from '../../interfaces/item-sidebar.interface';
import { Language } from '../../interfaces/language.interface';
import { TranslateService } from '@ngx-translate/core';
import { CurrentRouteService } from '../../services/currentRoute.service';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'shared-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input()
  show: boolean = false;

  public dinamicItems: ItemSidebar[] = [];
  public configItem: ItemSidebar = {
    label: 'Configuración',
    icon: 'settings.svg',
  };
  public languageItem: ItemSidebar = {
    label: 'Idioma',
    icon: 'earth.svg',
  };
  public languages: any[] = [];
  public selectedLanguage?: Language;
  public currentRoute: string = '';
  public currentLang: string = '';

  constructor(
    private currentRouteService: CurrentRouteService,
    private authService: AuthService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.currentRoute = this.currentRouteService.currentRoute;
    this.currentLang = localStorage.getItem('lang') || '';
    if (this.currentLang) {
      this.translate.setDefaultLang(this.currentLang);
      this.loadTranslations(this.currentLang);
      this.selectedLanguage = this.languages.find(
        (lang) => lang.code === this.currentLang
      );
    } else {
      this.translate.setDefaultLang('es');
      this.loadTranslations('es');
      this.selectedLanguage = { name: 'Español', code: 'es' };
    }
  }

  private updateItems() {
    this.getItems(this.currentRoute);
    this.getDefaultItems(this.currentRoute);
  }

  private getItems(path: string): void {
    if (path.includes('teams')) {
      this.translate.get('sidebarTeamsItems').subscribe((translations: any) => {
        this.dinamicItems = translations;
      });
    }
  }

  private getDefaultItems(path: string): void {
    this.translate.get('sidebarSettings').subscribe((translation: any) => {
      this.configItem = translation;
    });
    this.translate.get('sidebarLanguage').subscribe((translation: any) => {
      this.languageItem = translation;
    });
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
      const [currentLang] = this.languages.filter(
        (lang) => lang.code === languageCode
      );
      this.languages = this.languages.filter(
        (lang) => lang.code !== languageCode
      );
      this.languages.unshift(currentLang);
    });
    this.updateItems();
  }

  selectLanguage(code: string): void {
    this.loadTranslations(code);
    localStorage.setItem('lang', code);
  }

  onLogout() {
    this.authService.logout();
    window.location.reload();
  }
}
