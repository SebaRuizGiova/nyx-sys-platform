import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { ThemeSelectionService } from 'src/app/shared/services/themeSelection.service';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
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
    private fireAuth: AngularFireAuth,
    private database: DatabaseService
  ) {
    themeSelectionService.changeTheme(false);
  }

  public loginForm: FormGroup = this.fb.group({
    emailLogin: ['', [ Validators.required, Validators.pattern(this.validatorsService.emailPattern) ]],
    passwordLogin: ['', [ Validators.required ]],
  });
  public forgetForm: FormGroup = this.fb.group({
    emailForget: ['', [ Validators.required, Validators.pattern(this.validatorsService.emailPattern) ]],
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

  isValidFieldLogin( field: string ): boolean {
    return this.validatorsService.isValidField( this.loginForm, field );
  }

  isValidFieldForget( field: string ): boolean {
    return this.validatorsService.isValidField( this.forgetForm, field );
  }

  async onLogin() {
    if ( this.loginForm.invalid ) {
      this.loginForm.markAllAsTouched();
      return;
    };

    const email = this.loginForm.controls['emailLogin'].value;
    const password = this.loginForm.controls['passwordLogin'].value;

    try {
      await this.fireAuth
        .signInWithEmailAndPassword(email, password)
        .then(async (result) => {
          var getUser: any;
          const docRef = this.database.getAllUsers();
          const snapshot = await docRef.ref
            .where('UID', '==', result.user?.uid)
            .get();

          if (snapshot.empty) {
            const question = 'Error!';
            const explanation = 'This login has no account associated with it!';
            console.log(explanation);
          } else {
            snapshot.forEach((doc) => {
              getUser = doc.data();
            });

            localStorage.setItem('currentUser', JSON.stringify(getUser?.UID));

            if (getUser) {
              // window.location.reload();
            }
          }
        })
        .catch((error) => {
          const question = '';
          const explanation = 'User or password entered is not correct';

          console.log(explanation);
        });
    } catch (err) {
      console.log(err);
    }

    // this.loading = false;
  }
}
