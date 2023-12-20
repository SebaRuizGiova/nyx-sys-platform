import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ValidatorsService } from '../../services/validators.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
})
export class SettingsPageComponent {
  public showModalConfirmDelete: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private validatorsService: ValidatorsService,
    private translate: TranslateService,
  ) {}

  public contactForm: FormGroup = this.fb.group({
    // TODO: Email por defecto usuario
    email: [
      '',
      [
        Validators.required,
        Validators.pattern(this.validatorsService.emailPattern),
      ],
    ],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });
  public resetPasswordForm: FormGroup = this.fb.group({
    // TODO: Eliminar password por defecto
    actual: ['lucas.gonzaleznyxsys2023', [Validators.required]],
    new: [
      '',
      [
        Validators.required,
        Validators.pattern(this.validatorsService.passwordPattern),
      ],
    ],
    confirm: [
      '',
      [
        Validators.required,
        Validators.pattern(this.validatorsService.passwordPattern),
      ],
    ],
  });

  updatePassword() {
    if (this.resetPasswordForm.status === 'INVALID') {
      return;
    }
    this.authService
      .updatePassword(this.resetPasswordForm.value.actual, this.resetPasswordForm.value.new)
      .then(() => {
        // TODO: Agregar feedback
        console.log('Password cambiado');
      })
      .catch((err) => {
        console.log('Error al cambiar el password', err);
      });
  }

  validateInputPassword(field: string): string {
    const errors = this.resetPasswordForm.controls[field].errors;
    const touched = this.resetPasswordForm.controls[field].touched;
    if (errors && touched) {
      if (errors['required']) {
        return this.translate.instant('settingsMandatoryPassword');
      }
      if (errors['pattern']) {
        return this.translate.instant('settingsPatternPassword');
      }
    }
    return '';
  }

  sendEmail() {
    if (this.contactForm.status === 'INVALID') {
      return;
    }
    console.log('Email enviado\n', this.contactForm.value)
  }

  validateInputContact(field: string): string {
    const errors = this.contactForm.controls[field].errors;
    const touched = this.contactForm.controls[field].touched;
    if (errors && touched) {
      if (errors['required']) {
        return this.translate.instant('settingsMandatoryFieldError');
      }
      if (errors['pattern']) {
        return this.translate.instant('settingsValidEmailError');
      }
    }
    return '';
  }

  toggleModal() {
    this.showModalConfirmDelete = !this.showModalConfirmDelete;
  }
}
