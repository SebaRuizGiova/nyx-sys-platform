import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { ThemeSelectionService } from 'src/app/shared/services/themeSelection.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  providers: [MessageService],
})
export class LoginPageComponent implements OnInit {
  public emailText: string = '';
  public emailTextRestore: string = '';
  public passwordText: string = '';
  public isFlipped: boolean = false;

  constructor(
    private themeSelectionService: ThemeSelectionService,
    private validatorsService: ValidatorsService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    themeSelectionService.changeTheme(false);
  }

  public loginForm: FormGroup = this.fb.group({
    emailLogin: [
      'imendoza@fmf.mx',
      [
        Validators.required,
        Validators.pattern(this.validatorsService.emailPattern),
      ],
    ],
    passwordLogin: ['nyxsys2023', [Validators.required]],
  });
  public forgetForm: FormGroup = this.fb.group({
    emailForget: [
      'lucas.gonzalez@nyx-sys.com',
      [
        Validators.required,
        Validators.pattern(this.validatorsService.emailPattern),
      ],
    ],
  });

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

  isValidFieldLogin(field: string): boolean {
    return this.validatorsService.isValidField(this.loginForm, field);
  }

  isValidFieldForget(field: string): boolean {
    return this.validatorsService.isValidField(this.forgetForm, field);
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.controls['emailLogin'].value;
    const password = this.loginForm.controls['passwordLogin'].value;

    this.authService
      .login(email, password)
      .then(() => window.location.reload())
      .catch(() => {
        const errorTitle = this.translate.instant('ToastTitleError');
        const errorMessage = this.translate.instant('loginToastErrorLogin');
        this.messageService.add({
          severity: 'error',
          summary: errorTitle,
          detail: errorMessage,
        });
      });
  }

  onForgetPassword() {
    if (this.forgetForm.invalid) {
      this.forgetForm.markAllAsTouched();
      return;
    }

    const email = this.forgetForm.controls['emailForget'].value;

    this.authService
      .resetPassword(email)
      .then(() => {
        const successTitle = this.translate.instant('ToastTitleCorrect');
        const successMessage = this.translate.instant('loginToastSendEmail');
        this.messageService.add({
          severity: 'success',
          summary: successTitle,
          detail: successMessage,
        })
      })
      .catch(() => {
        const errorTitle = this.translate.instant('ToastTitleError');
        const errorMessage = this.translate.instant('loginToastErrorSendEmail');
        this.messageService.add({
          severity: 'error',
          summary: errorTitle,
          detail: errorMessage,
        });
      });
  }
}
