import { Component, Input, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { ItemSidebar } from '../../interfaces/item-sidebar.interface';
import { Language } from '../../interfaces/language.interface';
import { CurrentRouteService } from '../../services/currentRoute.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'shared-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input()
  show: boolean = false;

  constructor(
    private currentRouteService: CurrentRouteService,
    private authService: AuthService,
    public languageService: LanguageService,
    private translate: TranslateService,
  ) {}

  public dynamicItems: ItemSidebar[] = [];
  public configItem: ItemSidebar = {
    label: 'Configuración',
    icon: 'settings.svg',
    path: '/settings'
  };
  public languageItem: ItemSidebar = {
    label: 'Idioma',
    icon: 'earth.svg',
  };
  public languages: any[] = [];
  public selectedLanguage?: Language;
  public currentRoute: string = '';

  ngOnInit(): void {
    this.currentRouteService.rutaActiva$.subscribe((ruta) => {
      this.currentRoute = ruta;
      this.getItems(ruta);
    });
    this.loadTranslations();
    this.selectedLanguage = this.languages.find(
      (lang) => lang.code === this.languageService.currentLang
    );
  }

  private updateItems() {
    this.getItems(this.currentRoute);
    this.getDefaultItems();
  }

  private getItems(path: string): void {
    if (path.includes('groups')) {
      this.languageService
        .getTranslate('sidebarItemsGroupView')
        .subscribe((translations: any) => {
          this.dynamicItems = translations;
        });
    } else if (path.includes('admin')) {
      this.languageService
        .getTranslate('sidebarItemsAdmin')
        .subscribe((translations: any) => {
          this.dynamicItems = translations;
        });
    } else {
      this.languageService
        .getTranslate('sidebarItems')
        .subscribe((translations: any) => {
          this.dynamicItems = translations;
        });
    }
  }

  private getDefaultItems(): void {
    this.languageService.getTranslate('sidebarSettings').subscribe((translation: any) => {
      this.configItem = {
        ...this.configItem,
        label: translation
      };
    });
    this.languageService.getTranslate('sidebarLanguage').subscribe((translation: any) => {
      this.languageItem = {
        ...this.languageItem,
        label: translation
      };
    });
  }

  toggleSidebar(value?: boolean): void {
    if (value?.toString()) {
      this.show = value;
      return;
    }
    this.show = !this.show;
  }

  private loadTranslations() {
    this.languageService.getTranslate('languagesDropdown').subscribe((translations: any) => {
      this.languages = translations;
      const [currentLang] = this.languages.filter(
        (lang) => lang.code === this.languageService.currentLang
      );
      this.languages = this.languages.filter(
        (lang) => lang.code !== this.languageService.currentLang
      );
      this.languages.unshift(currentLang);
    });
    this.updateItems();
  }

  selectLanguage(code: string): void {
    this.languageService.selectLang(code);
    this.loadTranslations();
    localStorage.setItem('lang', code);
  }

  onLogout() {
    this.authService.logout();
    window.location.reload();
  }
}
