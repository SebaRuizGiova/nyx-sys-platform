import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeSelectionService } from 'src/app/shared/services/themeSelection.service';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  public emailText: string = '';
  public emailTextRestore: string = '';
  public passwordText: string = '';
  public isFlipped: boolean = false;

  constructor(
    private themeSelectionService: ThemeSelectionService,
    private translate: TranslateService
  ) {
    themeSelectionService.changeTheme(false)
  }

  ngOnInit() {
    const codeLang = localStorage.getItem('lang');
    if (codeLang) {
      this.translate.setDefaultLang(codeLang);
      this.translate.use(codeLang);
    } else {
      this.translate.setDefaultLang('es');
      this.translate.use('es');
    }
  }

  toggleCard() {
    this.isFlipped = !this.isFlipped;
  }

  switchLanguage(code: string) {
    this.translate.use(code);
    localStorage.setItem('lang', code);
  }
}
