import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeSelectionService {
  themeSelection: boolean = false;

  constructor(@Inject(DOCUMENT) private document: Document) {
    let theme = window.localStorage.getItem('theme');
    if (theme) {
      this.themeSelection = theme === 'dark' ? true : false
      this.changeTheme(this.themeSelection);
    }
  }

  changeTheme(state: boolean) {
    let theme = state ? 'dark' : 'light';
    window.localStorage.setItem('theme', theme);
    let themeLink = this.document.getElementById('app-theme') as HTMLLinkElement;
    themeLink.href = `md-${theme}-indigo.css`;
  }

}
